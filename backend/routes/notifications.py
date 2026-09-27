from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.user import User
from models.project import Project, ProjectMember
from models.analytics import Notification, TimelineEvent
from schemas.report import NotificationResponse
from services.notification_service import NotificationService
from utils.jwt import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class RespondInviteRequest(BaseModel):
    notification_id: str
    accept: bool

@router.get("", response_model=List[NotificationResponse])
async def list_user_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await NotificationService.get_user_notifications(current_user.id, db)

@router.put("/read-all")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await NotificationService.mark_all_as_read(current_user.id, db)

@router.put("/{notif_id}/read")
async def mark_read(
    notif_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await NotificationService.mark_as_read(notif_id, db)

@router.post("/respond-invite")
@router.post("/{notif_id}/respond")
async def respond_to_invite(
    data: RespondInviteRequest = None,
    notif_id: str = None,
    accept: bool = True,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    target_id = notif_id or (data.notification_id if data else None)
    is_accept = data.accept if data else accept

    res = await db.execute(select(Notification).filter(Notification.id == target_id, Notification.user_id == current_user.id))
    notif = res.scalars().first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.read = True

    if notif.action and notif.action.startswith("project_invite"):
        parts = notif.action.split(":", 1)
        project_id = parts[1] if len(parts) > 1 else ""
        proj_res = await db.execute(select(Project).filter(Project.id == project_id))
        proj = proj_res.scalars().first()

        if is_accept:
            notif.action = f"project_invite_accepted:{project_id}"
            if "— Status:" not in notif.description:
                notif.description = f"{notif.description} — Status: Accepted"
        else:
            notif.action = f"project_invite_declined:{project_id}"
            if "— Status:" not in notif.description:
                notif.description = f"{notif.description} — Status: Declined"

        if proj:
            existing_mem_res = await db.execute(
                select(ProjectMember).filter(ProjectMember.project_id == proj.id, ProjectMember.user_id == current_user.id)
            )
            existing_mem = existing_mem_res.scalars().first()

            if is_accept:
                if existing_mem:
                    existing_mem.status = "Accepted"
                else:
                    mem = ProjectMember(
                        project_id=proj.id,
                        user_id=current_user.id,
                        name=current_user.name,
                        role="Developer",
                        status="Accepted"
                    )
                    db.add(mem)

                # Add timeline event
                timeline = TimelineEvent(
                    student_id=current_user.id,
                    year=current_user.year or 1,
                    title=f"Joined Project: {proj.title}",
                    description=f"Joined team collaboration for {proj.title}",
                    date="Just now",
                    status="completed",
                    type="project"
                )
                db.add(timeline)

                # Notify project creator
                creator_notif = Notification(
                    user_id=proj.created_by,
                    type="project",
                    title="Invite Accepted 🎉",
                    description=f"{current_user.name} accepted your invite to join '{proj.title}'",
                    timestamp="Just now",
                    read=False
                )
                db.add(creator_notif)
            else:
                # Declined invite
                if existing_mem and existing_mem.status == "Pending":
                    await db.delete(existing_mem)

    await db.commit()
    return {"status": "success", "accepted": is_accept}
