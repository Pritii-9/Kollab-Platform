from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from models.analytics import Notification, Announcement
from schemas.report import NotificationResponse, AnnouncementResponse, AnnouncementCreate

class NotificationService:
    @staticmethod
    async def get_user_notifications(user_id: str, db: AsyncSession) -> List[NotificationResponse]:
        result = await db.execute(
            select(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
        )
        notifs = result.scalars().all()
        return [
            NotificationResponse(
                id=n.id,
                type=n.type,
                title=n.title,
                description=n.description,
                timestamp=n.timestamp or n.created_at.strftime("%Y-%m-%d %H:%M"),
                read=n.read,
                action=n.action
            ) for n in notifs
        ]

    @staticmethod
    async def mark_as_read(notif_id: str, db: AsyncSession):
        await db.execute(
            update(Notification).filter(Notification.id == notif_id).values(read=True)
        )
        await db.commit()
        return {"status": "success"}

    @staticmethod
    async def mark_all_as_read(user_id: str, db: AsyncSession):
        await db.execute(
            update(Notification).filter(Notification.user_id == user_id).values(read=True)
        )
        await db.commit()
        return {"status": "success"}

    @staticmethod
    async def list_announcements(db: AsyncSession) -> List[AnnouncementResponse]:
        result = await db.execute(
            select(Announcement).order_by(Announcement.created_at.desc())
        )
        anns = result.scalars().all()
        return [
            AnnouncementResponse(
                id=a.id,
                title=a.title,
                targetBadge=a.target_badge,
                message=a.message,
                seenCount=a.seen_count,
                readCount=a.read_count,
                timestamp=a.timestamp
            ) for a in anns
        ]

    @staticmethod
    async def create_announcement(data: AnnouncementCreate, coordinator_name: str, db: AsyncSession) -> AnnouncementResponse:
        ann = Announcement(
            title=data.title,
            message=data.message,
            target_badge=data.target_badge or "All Students",
            created_by=coordinator_name,
            scheduled_at=data.scheduled_at,
            timestamp="Just now"
        )
        db.add(ann)
        await db.commit()
        await db.refresh(ann)
        return AnnouncementResponse(
            id=ann.id,
            title=ann.title,
            targetBadge=ann.target_badge,
            message=ann.message,
            seenCount=0,
            readCount=0,
            timestamp=ann.timestamp
        )
