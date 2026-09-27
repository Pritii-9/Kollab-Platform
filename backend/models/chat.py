from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from models.base import BaseModel

class ChatMessage(BaseModel):
    __tablename__ = "chat_messages"

    project_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    channel: Mapped[str] = mapped_column(String(50), default="general", index=True, nullable=False)
    sender_id: Mapped[str] = mapped_column(String(50), nullable=False)
    sender_name: Mapped[str] = mapped_column(String(100), nullable=False)
    sender_avatar: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
