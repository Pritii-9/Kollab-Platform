import json
from typing import Optional, List
from sqlalchemy import String, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import BaseModel

class Project(BaseModel):
    __tablename__ = "projects"

    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    tech_stack_json: Mapped[str] = mapped_column(Text, default="[]")  # JSON string of list of techs
    team_size: Mapped[int] = mapped_column(Integer, default=4)
    timeline: Mapped[str] = mapped_column(String(50), default="3 months")
    status: Mapped[str] = mapped_column(String(20), default="Active")  # 'Active' | 'Completed' | 'Archived'
    progress: Mapped[int] = mapped_column(Integer, default=0)
    start_date: Mapped[str] = mapped_column(String(50), default="")
    end_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_by: Mapped[str] = mapped_column(String, nullable=False)

    # Relationships
    members: Mapped[List["ProjectMember"]] = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    milestones: Mapped[List["Milestone"]] = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")

    @property
    def tech_stack(self) -> List[str]:
        try:
            return json.loads(self.tech_stack_json)
        except Exception:
            return []

    @tech_stack.setter
    def tech_stack(self, val: List[str]):
        self.tech_stack_json = json.dumps(val)

class ProjectMember(BaseModel):
    __tablename__ = "project_members"

    project_id: Mapped[str] = mapped_column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="Developer")
    avatar: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    project: Mapped["Project"] = relationship("Project", back_populates="members")

class Task(BaseModel):
    __tablename__ = "tasks"

    project_id: Mapped[str] = mapped_column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="Backlog")  # 'Backlog' | 'In Progress' | 'In Review' | 'Done'
    priority: Mapped[str] = mapped_column(String(20), default="Medium")  # 'High' | 'Medium' | 'Low'
    assignee_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    assignee_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    assignee_avatar: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    due_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    labels_json: Mapped[str] = mapped_column(Text, default="[]")

    project: Mapped["Project"] = relationship("Project", back_populates="tasks")

    @property
    def labels(self) -> List[str]:
        try:
            return json.loads(self.labels_json)
        except Exception:
            return []

    @labels.setter
    def labels(self, val: List[str]):
        self.labels_json = json.dumps(val)

class Milestone(BaseModel):
    __tablename__ = "milestones"

    project_id: Mapped[str] = mapped_column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    due_date: Mapped[str] = mapped_column(String(50), default="")
    status: Mapped[str] = mapped_column(String(20), default="upcoming")  # 'completed' | 'active' | 'upcoming'
    progress: Mapped[int] = mapped_column(Integer, default=0)

    project: Mapped["Project"] = relationship("Project", back_populates="milestones")
