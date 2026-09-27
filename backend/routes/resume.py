import os
import uuid
import json
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.user import User
from services.s3_service import S3Service
from utils.jwt import get_current_user

router = APIRouter(prefix="/resume", tags=["Resume Dossier"])


def resolve_resume_url(raw_url: str) -> str:
    if not raw_url or not isinstance(raw_url, str):
        return ""
    if raw_url.startswith("http://") or raw_url.startswith("https://") or raw_url.startswith("blob:"):
        return raw_url
    if raw_url.startswith("resumes/"):
        presigned = S3Service.generate_presigned_url(raw_url, expiration_seconds=86400)
        return presigned or f"https://kollab-s3-store.s3.eu-north-1.amazonaws.com/{raw_url}"
    if "amazonaws.com/" in raw_url:
        key = raw_url.split("amazonaws.com/")[-1].split("?")[0]
        presigned = S3Service.generate_presigned_url(key, expiration_seconds=86400)
        return presigned or raw_url
    return raw_url


def get_user_resumes(user: User) -> List[dict]:
    if user.resumes_json:
        try:
            items = json.loads(user.resumes_json)
            if isinstance(items, list):
                valid_items = [r for r in items if isinstance(r, dict)]
                if valid_items:
                    return valid_items
        except Exception:
            pass
    if user.resume_url:
        return [{
            "id": "res_1",
            "version": "v1.1",
            "title": "Primary Placement Resume",
            "name": user.resume_name or "resume.pdf",
            "url": str(user.resume_url),
            "stored_path": str(user.resume_url),
            "size": "Verified PDF",
            "date": "Active Version",
            "is_primary": True
        }]
    return []


def save_user_resumes(user: User, resumes: List[dict]):
    primary = next((r for r in resumes if isinstance(r, dict) and r.get("is_primary")), None)
    if not primary and resumes:
        if isinstance(resumes[0], dict):
            resumes[0]["is_primary"] = True
            primary = resumes[0]

    user.resumes_json = json.dumps(resumes)

    if primary:
        user.resume_url = primary.get("stored_path") or primary.get("url")
        user.resume_name = primary.get("name")
    else:
        user.resume_url = None
        user.resume_name = None


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    is_primary: Optional[bool] = Form(True),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    contents = await file.read()

    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large — max 10 MB")

    file_ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if file_ext not in ["pdf", "doc", "docx"]:
        raise HTTPException(status_code=400, detail="Only PDF/DOC files are accepted")

    if file.content_type not in [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]:
        raise HTTPException(status_code=400, detail="Invalid content type")

    s3_key = f"resumes/{current_user.id}/{uuid.uuid4()}.{file_ext}"

    s3_url = await S3Service.upload_file(
        file_bytes=contents,
        key=s3_key,
        content_type=file.content_type or "application/pdf"
    )

    if s3_url.startswith("local://"):
        user_upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "resumes", str(current_user.id))
        os.makedirs(user_upload_dir, exist_ok=True)
        local_filename = f"{uuid.uuid4().hex[:8]}_{file.filename}"
        file_path = os.path.join(user_upload_dir, local_filename)
        with open(file_path, "wb") as f:
            f.write(contents)
        stored_path = f"/uploads/resumes/{current_user.id}/{local_filename}"
        client_url = stored_path
    else:
        stored_path = s3_key
        presigned = S3Service.generate_presigned_url(s3_key, expiration_seconds=86400)
        client_url = presigned or s3_url

    result = await db.execute(select(User).filter(User.id == current_user.id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = get_user_resumes(user)
    
    auto_title = title.strip() if title and title.strip() else file.filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()

    make_primary = is_primary or len(existing) == 0

    if make_primary:
        for r in existing:
            if isinstance(r, dict):
                r["is_primary"] = False

    new_item = {
        "id": f"res_{uuid.uuid4().hex[:8]}",
        "version": f"v1.{len(existing) + 1}",
        "title": auto_title,
        "name": file.filename,
        "url": client_url,
        "stored_path": stored_path,
        "size": f"{round(len(contents) / (1024 * 1024), 2)} MB",
        "date": datetime.now().strftime("%b %d, %Y"),
        "is_primary": make_primary,
        "highlights": [
            f"Verified placement resume: {file.filename}",
            f"Trust rating: {current_user.trust_score}/100",
            "Recruiter-ready dossier format"
        ]
    }

    existing.insert(0, new_item)
    save_user_resumes(user, existing)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return {
        "status": "success",
        "item": {**new_item, "url": resolve_resume_url(new_item["stored_path"])},
        "resumes": [{**r, "url": resolve_resume_url(r.get("stored_path") or r.get("url") or "")} for r in existing if isinstance(r, dict)],
        "name": file.filename,
        "url": resolve_resume_url(stored_path),
        "size": new_item["size"],
        "date": new_item["date"]
    }


@router.get("/me")
async def get_my_resume(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(select(User).filter(User.id == current_user.id))
        user = result.scalars().first() or current_user
        if not user:
            return {"url": None, "name": None, "resumes": [], "primary": None}

        resumes = get_user_resumes(user)
        resolved = []
        for r in resumes:
            if not isinstance(r, dict):
                continue
            r_url = resolve_resume_url(r.get("stored_path") or r.get("url") or "")
            resolved.append({**r, "url": r_url})

        primary = next((r for r in resolved if r.get("is_primary")), None) or (resolved[0] if resolved else None)

        return {
            "url": primary["url"] if primary and isinstance(primary, dict) else None,
            "name": primary["name"] if primary and isinstance(primary, dict) else None,
            "primary": primary,
            "resumes": resolved
        }
    except Exception as e:
        return {"url": None, "name": None, "resumes": [], "primary": None, "error": str(e)}


@router.put("/set-primary/{resume_id}")
async def set_primary_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).filter(User.id == current_user.id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    resumes = get_user_resumes(user)
    found = False
    for r in resumes:
        if isinstance(r, dict):
            if r.get("id") == resume_id or r.get("version") == resume_id:
                r["is_primary"] = True
                found = True
            else:
                r["is_primary"] = False

    if not found:
        raise HTTPException(status_code=404, detail="Resume not found")

    save_user_resumes(user, resumes)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    resolved = [{**r, "url": resolve_resume_url(r.get("stored_path") or r.get("url") or "")} for r in resumes if isinstance(r, dict)]
    return {"status": "success", "message": "Primary resume updated", "resumes": resolved}


@router.get("/versions")
async def list_versions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).filter(User.id == current_user.id))
    user = result.scalars().first() or current_user
    if not user:
        return []
    resumes = get_user_resumes(user)
    return [{**r, "url": resolve_resume_url(r.get("stored_path") or r.get("url") or "")} for r in resumes if isinstance(r, dict)]


@router.delete("/versions/{version_id}")
@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).filter(User.id == current_user.id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    resumes = get_user_resumes(user)
    resumes = [r for r in resumes if isinstance(r, dict) and r.get("id") != resume_id and r.get("version") != resume_id]

    save_user_resumes(user, resumes)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    resolved = [{**r, "url": resolve_resume_url(r.get("stored_path") or r.get("url") or "")} for r in resumes if isinstance(r, dict)]
    return {"status": "success", "message": "Resume deleted", "resumes": resolved}


@router.delete("/me")
async def delete_active_resume(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).filter(User.id == current_user.id))
    user = result.scalars().first()
    if user:
        resumes = get_user_resumes(user)
        if resumes:
            resumes = [r for r in resumes if isinstance(r, dict) and not r.get("is_primary")]
            save_user_resumes(user, resumes)
        else:
            user.resume_url = None
            user.resume_name = None
            user.resumes_json = None
        await db.commit()
    return {"status": "success", "message": "Active resume removed"}

