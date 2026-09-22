import json
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import BaseModel

class Test(BaseModel):
    __tablename__ = "tests"

    title: Mapped[str] = mapped_column(String(150), nullable=False)
    skill_name: Mapped[str] = mapped_column(String(100), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(20), default="Medium")  # 'Easy' | 'Medium' | 'Hard' | 'Mixed'
    time_limit: Mapped[int] = mapped_column(Integer, default=30)  # minutes
    attempts: Mapped[int] = mapped_column(Integer, default=2)

    # Anti-cheat settings
    randomize_questions: Mapped[bool] = mapped_column(Boolean, default=True)
    randomize_options: Mapped[bool] = mapped_column(Boolean, default=True)
    tab_detection: Mapped[bool] = mapped_column(Boolean, default=True)
    fullscreen_lock: Mapped[bool] = mapped_column(Boolean, default=True)

    # Target
    assigned_to: Mapped[str] = mapped_column(String(20), default="batch")  # 'batch' | 'year' | 'individual'
    target_batch: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    target_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    target_students_json: Mapped[str] = mapped_column(Text, default="[]")
    due_date: Mapped[str] = mapped_column(String(50), default="")
    created_by: Mapped[str] = mapped_column(String, default="Coordinator")

    # Relationships
    questions: Mapped[List["Question"]] = relationship("Question", back_populates="test", cascade="all, delete-orphan")
    attempts_records: Mapped[List["TestAttempt"]] = relationship("TestAttempt", back_populates="test", cascade="all, delete-orphan")

    @property
    def target_students(self) -> List[str]:
        try:
            return json.loads(self.target_students_json)
        except Exception:
            return []

    @target_students.setter
    def target_students(self, val: List[str]):
        self.target_students_json = json.dumps(val)

class Question(BaseModel):
    __tablename__ = "questions"

    test_id: Mapped[str] = mapped_column(String, ForeignKey("tests.id", ondelete="CASCADE"), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    topic: Mapped[str] = mapped_column(String(100), default="General")
    difficulty: Mapped[str] = mapped_column(String(20), default="Medium")
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    test: Mapped["Test"] = relationship("Test", back_populates="questions")
    options: Mapped[List["QuestionOption"]] = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan")

class QuestionOption(BaseModel):
    __tablename__ = "question_options"

    question_id: Mapped[str] = mapped_column(String, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)

    question: Mapped["Question"] = relationship("Question", back_populates="options")

class TestAttempt(BaseModel):
    __tablename__ = "test_attempts"

    test_id: Mapped[str] = mapped_column(String, ForeignKey("tests.id", ondelete="CASCADE"), nullable=False)
    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    test_title: Mapped[str] = mapped_column(String(150), default="")
    skill_name: Mapped[str] = mapped_column(String(100), default="")
    score: Mapped[int] = mapped_column(Integer, default=0)
    total: Mapped[int] = mapped_column(Integer, default=0)
    percentage: Mapped[float] = mapped_column(Float, default=0.0)
    correct: Mapped[int] = mapped_column(Integer, default=0)
    wrong: Mapped[int] = mapped_column(Integer, default=0)
    skipped: Mapped[int] = mapped_column(Integer, default=0)
    time_taken: Mapped[int] = mapped_column(Integer, default=0)  # seconds
    tab_switches: Mapped[int] = mapped_column(Integer, default=0)
    passed: Mapped[bool] = mapped_column(Boolean, default=False)
    badge_earned: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    answers_json: Mapped[str] = mapped_column(Text, default="{}")  # {question_id: option_id}
    topic_breakdown_json: Mapped[str] = mapped_column(Text, default="[]")
    question_results_json: Mapped[str] = mapped_column(Text, default="[]")
    completed_at: Mapped[str] = mapped_column(String(50), default="")

    test: Mapped["Test"] = relationship("Test", back_populates="attempts_records")
    student: Mapped["User"] = relationship("User", back_populates="test_attempts")
