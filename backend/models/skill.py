from typing import Optional
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import BaseModel

class StudentSkill(BaseModel):
    __tablename__ = "student_skills"

    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # 'verified' | 'pending' | 'failed'
    score: Mapped[int] = mapped_column(Integer, default=0)
    last_tested: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    student: Mapped["User"] = relationship("User", back_populates="skills")
