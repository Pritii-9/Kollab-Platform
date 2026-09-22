from typing import Optional
from sqlalchemy import String, Integer, Boolean, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import BaseModel

class Notification(BaseModel):
    __tablename__ = "notifications"

    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(30), default="system")  # 'test' | 'project' | 'team' | 'system'
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    timestamp: Mapped[str] = mapped_column(String(50), default="")
    action: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

class Announcement(BaseModel):
    __tablename__ = "announcements"

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    target_badge: Mapped[str] = mapped_column(String(100), default="All Students")
    created_by: Mapped[str] = mapped_column(String(100), default="Coordinator")
    seen_count: Mapped[int] = mapped_column(Integer, default=0)
    read_count: Mapped[int] = mapped_column(Integer, default=0)
    timestamp: Mapped[str] = mapped_column(String(50), default="Just now")
    scheduled_at: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

class TimelineEvent(BaseModel):
    __tablename__ = "timeline_events"

    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    year: Mapped[int] = mapped_column(Integer, default=1)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    date: Mapped[str] = mapped_column(String(50), default="")
    status: Mapped[str] = mapped_column(String(20), default="completed")  # 'completed' | 'active' | 'upcoming'
    type: Mapped[str] = mapped_column(String(30), default="test")  # 'profile' | 'test' | 'project' | 'review' | 'github' | 'placement'

    student: Mapped["User"] = relationship("User", back_populates="timeline_events")
