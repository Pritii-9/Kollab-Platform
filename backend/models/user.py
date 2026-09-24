from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import BaseModel

class User(BaseModel):
    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="student", nullable=False)  # 'coordinator' | 'student'
    
    # Student Profile fields
    roll_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    batch: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    cgpa: Mapped[Optional[float]] = mapped_column(Float, default=0.0)
    avatar: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    github: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    linkedin: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    trust_score: Mapped[int] = mapped_column(Integer, default=70)
    placement_status: Mapped[str] = mapped_column(String(30), default="Eligible")  # 'Placed' | 'Eligible' | 'Ineligible' | 'In Process'
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    skills: Mapped[List["StudentSkill"]] = relationship("StudentSkill", back_populates="student", cascade="all, delete-orphan")
    reviews_received: Mapped[List["PeerReview"]] = relationship("PeerReview", foreign_keys="PeerReview.student_id", back_populates="student", cascade="all, delete-orphan")
    timeline_events: Mapped[List["TimelineEvent"]] = relationship("TimelineEvent", back_populates="student", cascade="all, delete-orphan")
    test_attempts: Mapped[List["TestAttempt"]] = relationship("TestAttempt", back_populates="student", cascade="all, delete-orphan")

class OTPVerification(BaseModel):
    __tablename__ = "otp_verifications"

    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    otp_code: Mapped[str] = mapped_column(String(10), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
