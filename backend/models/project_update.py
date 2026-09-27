from typing import Optional
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import BaseModel


class ProjectUpdate(BaseModel):
    """
    A short status post made by a team member on a project.
    Appears in the project's Update Feed (like a team activity wall).
    """
    __tablename__ = "project_updates"

    project_id: Mapped[str] = mapped_column(
        String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    student_id: Mapped[str] = mapped_column(String, nullable=False)
    student_name: Mapped[str] = mapped_column(String(100), nullable=False)
    student_avatar: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Status tag: "done" | "in_progress" | "blocked" | "review" | "idea"
    tag: Mapped[str] = mapped_column(String(30), default="in_progress", nullable=False)

    # The update message
    message: Mapped[str] = mapped_column(Text, nullable=False)
