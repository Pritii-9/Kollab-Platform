from sqlalchemy import String, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import BaseModel

class PeerReview(BaseModel):
    __tablename__ = "peer_reviews"

    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reviewer_id: Mapped[str] = mapped_column(String, nullable=False)
    reviewer_name: Mapped[str] = mapped_column(String(100), nullable=False)
    reviewer_avatar: Mapped[str] = mapped_column(String(255), default="")
    project_name: Mapped[str] = mapped_column(String(150), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, default=5)
    comment: Mapped[str] = mapped_column(Text, default="")
    date: Mapped[str] = mapped_column(String(50), default="")

    student: Mapped["User"] = relationship("User", foreign_keys=[student_id], back_populates="reviews_received")
