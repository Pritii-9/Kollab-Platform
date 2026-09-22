from typing import Optional
from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column
from models.base import BaseModel

class Batch(BaseModel):
    __tablename__ = "batches"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    section: Mapped[str] = mapped_column(String(50), nullable=False)
    coordinator: Mapped[str] = mapped_column(String(100), default="Prof. Sarah Jenkins")
    academic_year: Mapped[str] = mapped_column(String(50), default="2025-2026")
    total_students: Mapped[int] = mapped_column(Integer, default=40)
    skill_verified: Mapped[int] = mapped_column(Integer, default=0)
    active_projects: Mapped[int] = mapped_column(Integer, default=0)
    placement_ready: Mapped[int] = mapped_column(Integer, default=0)
    readiness_percent: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="Active")  # 'Active' | 'Completed' | 'Upcoming'
