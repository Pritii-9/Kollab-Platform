import json
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.user import User
from models.project import Project, ProjectMember
from models.chat import ChatMessage
from utils.jwt import get_current_user

router = APIRouter(prefix="/chat", tags=["Team Chat Workspace"])

class SendMessageRequest(BaseModel):
    channel: str = "general"
    text: str

@router.get("/my-projects")
async def get_my_chat_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch real projects associated with the current user, fallback to all active projects or provision default."""
    all_projs_res = await db.execute(select(Project))
    all_projs = all_projs_res.scalars().all()

    if not all_projs:
        # Auto-provision default Kollab project so active project workspace is always available
        default_proj = Project(
            id=f"proj_{uuid.uuid4().hex[:8]}",
            title="Kollab AI Team Project",
            description="Full Stack Collaborative Workspace & Teammate Dossier",
            tech_stack_json=json.dumps(["React", "FastAPI", "Python", "TailwindCSS"]),
            team_size=4,
            timeline="3 months",
            status="Active",
            progress=40,
            created_by=current_user.id,
            start_date=datetime.now(timezone.utc).strftime("%Y-%m-%d")
        )
        db.add(default_proj)
        await db.flush()

        default_mem = ProjectMember(
            project_id=default_proj.id,
            user_id=current_user.id,
            name=current_user.name,
            role="Project Lead",
            status="Accepted"
        )
        db.add(default_mem)
        await db.commit()

        all_projs = [default_proj]

    result = []
    for p in all_projs:
        mems_res = await db.execute(select(ProjectMember).filter(ProjectMember.project_id == p.id))
        mems = mems_res.scalars().all()

        member_list = []
        for m in mems:
            member_list.append({
                "id": m.id,
                "userId": m.user_id,
                "name": m.name,
                "role": m.role,
                "avatar": m.avatar or (m.name[0].upper() if m.name else "U"),
                "status": m.status or "Accepted"
            })

        if not member_list:
            member_list.append({
                "id": f"mem-{current_user.id}",
                "userId": current_user.id,
                "name": current_user.name,
                "role": "Project Lead",
                "avatar": current_user.name[0].upper() if current_user.name else "U",
                "status": "Accepted"
            })

        result.append({
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "techStack": p.tech_stack,
            "members": member_list,
            "memberCount": len(member_list)
        })

    return result

@router.get("/projects/{project_id}/members")
async def get_project_chat_members(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch real associated members of the project."""
    mems_res = await db.execute(select(ProjectMember).filter(ProjectMember.project_id == project_id))
    mems = mems_res.scalars().all()

    members = []
    for m in mems:
        u_res = await db.execute(select(User).filter(User.id == m.user_id))
        u = u_res.scalars().first()
        members.append({
            "id": m.id,
            "userId": m.user_id,
            "name": m.name,
            "role": m.role,
            "status": m.status or "Accepted",
            "avatar": m.avatar or (u.avatar if u else (m.name[0].upper() if m.name else "U")),
            "email": u.email if u else "",
            "trustScore": u.trust_score if u else 70,
            "isOnline": True
        })

    if not members:
        members.append({
            "id": f"mem-{current_user.id}",
            "userId": current_user.id,
            "name": current_user.name,
            "role": "Project Lead",
            "status": "Accepted",
            "avatar": current_user.name[0].upper() if current_user.name else "U",
            "email": current_user.email,
            "trustScore": current_user.trust_score or 70,
            "isOnline": True
        })

    return members

@router.get("/projects/{project_id}/messages")
async def get_project_messages(
    project_id: str,
    channel: str = Query("general"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch real database messages for a specific project and channel."""
    res = await db.execute(
        select(ChatMessage)
        .filter(ChatMessage.project_id == project_id, ChatMessage.channel == channel)
        .order_by(ChatMessage.created_at.asc())
    )
    msgs = res.scalars().all()
    return [
        {
            "id": m.id,
            "projectId": m.project_id,
            "channel": m.channel,
            "senderId": m.sender_id,
            "sender": m.sender_name,
            "avatar": m.sender_avatar or (m.sender_name[0].upper() if m.sender_name else "U"),
            "text": m.text,
            "time": m.created_at.strftime("%I:%M %p") if m.created_at else "Just now",
            "createdAt": m.created_at.isoformat() if m.created_at else "",
            "isSelf": m.sender_id == current_user.id
        }
        for m in msgs
    ]

@router.post("/projects/{project_id}/messages")
async def send_project_message(
    project_id: str,
    data: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Post a real chat message to a project channel."""
    text_content = data.text.strip()
    if not text_content:
        raise HTTPException(status_code=400, detail="Message text cannot be empty")

    msg = ChatMessage(
        project_id=project_id,
        channel=data.channel or "general",
        sender_id=current_user.id,
        sender_name=current_user.name,
        sender_avatar=current_user.name[0].upper() if current_user.name else "U",
        text=text_content
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    return {
        "id": msg.id,
        "projectId": msg.project_id,
        "channel": msg.channel,
        "senderId": msg.sender_id,
        "sender": msg.sender_name,
        "avatar": msg.sender_name[0].upper() if msg.sender_name else "U",
        "text": msg.text,
        "time": msg.created_at.strftime("%I:%M %p") if msg.created_at else "Just now",
        "createdAt": msg.created_at.isoformat() if msg.created_at else "",
        "isSelf": True
    }
