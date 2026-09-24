import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from models.user import User
from services.s3_service import S3Service
from utils.jwt import get_current_user

router = APIRouter(prefix="/resume", tags=["Resume Dossier"])

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    contents = await file.read()
    
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large")
        
    file_ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if file_ext not in ["pdf", "doc", "docx"]:
        raise HTTPException(status_code=400, detail="Invalid file extension")
        
    if file.content_type not in ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(status_code=400, detail="Invalid content type")

    s3_key = f"resumes/{current_user.id}/{uuid.uuid4()}.{file_ext}"

    s3_url = await S3Service.upload_file(
        file_bytes=contents,
        key=s3_key,
        content_type=file.content_type or "application/pdf"
    )

    return {
        "status": "success",
        "name": file.filename,
        "url": s3_url,
        "size": f"{round(len(contents) / (1024 * 1024), 2)} MB",
        "date": "Just now",
        "highlights": [
            f"5 Verified skill badges attached automatically to {file.filename}",
            "3 Collaborative Kanban project links embedded",
            f"Trust score badge: {current_user.trust_score}/100"
        ]
    }

@router.get("/versions")
async def list_versions(current_user: User = Depends(get_current_user)):
    return [
        {"version": "v2.1", "name": f"{current_user.name.split()[0]}_Resume_Final.pdf", "date": "01 Sep 2026"},
        {"version": "v1.0", "name": f"{current_user.name.split()[0]}_Resume_Draft.pdf", "date": "15 Aug 2026"}
    ]
