from typing import Optional, List
from pydantic import BaseModel

class ProjectMemberSchema(BaseModel):
    id: str
    name: str
    role: str
    avatar: Optional[str] = None

    class Config:
        from_attributes = True

class TaskSchema(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    assigneeId: Optional[str] = None
    assigneeName: Optional[str] = None
    assigneeAvatar: Optional[str] = None
    dueDate: Optional[str] = None
    labels: List[str] = []
    projectId: str
    createdAt: str = ""

    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    status: Optional[str] = "Backlog"
    priority: Optional[str] = "Medium"
    assignee: Optional[str] = "Aanya Sharma"
    due_date: Optional[str] = None
    labels: Optional[List[str]] = []

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee_id: Optional[str] = None
    assignee_name: Optional[str] = None
    due_date: Optional[str] = None
    labels: Optional[List[str]] = None

class MilestoneSchema(BaseModel):
    id: str
    projectId: str
    title: str
    description: str
    dueDate: str
    status: str
    progress: Optional[int] = 0

    class Config:
        from_attributes = True

class MilestoneCreate(BaseModel):
    title: str
    description: str = ""
    due_date: str = ""
    status: Optional[str] = "upcoming"
    progress: Optional[int] = 0

class ProjectCreate(BaseModel):
    title: str
    description: str
    tech_stack: List[str] = []
    team_size: int = 4
    timeline: str = "3 months"

class ProjectResponse(BaseModel):
    id: str
    title: str
    description: str
    techStack: List[str]
    teamSize: int
    timeline: str
    status: str
    progress: int
    members: List[ProjectMemberSchema] = []
    startDate: str
    endDate: Optional[str] = None
    tasks: List[TaskSchema] = []
    createdBy: str

    class Config:
        from_attributes = True
