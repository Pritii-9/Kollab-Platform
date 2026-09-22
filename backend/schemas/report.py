from typing import List, Optional
from pydantic import BaseModel

class BatchReportResponse(BaseModel):
    id: str
    batchName: str
    department: str
    year: int
    totalStudents: int
    skillVerified: int
    avgCGPA: float
    readinessPercent: int
    placedCount: int
    topSkills: List[str] = []
    status: str

    class Config:
        from_attributes = True

class PlacementStatResponse(BaseModel):
    company: str
    hired: int
    role: str
    batch: str

class AnnouncementCreate(BaseModel):
    title: str
    message: str
    target_badge: Optional[str] = "All Students"
    scheduled_at: Optional[str] = None

class AnnouncementResponse(BaseModel):
    id: str
    title: str
    targetBadge: str
    message: str
    seenCount: int
    readCount: int
    timestamp: str

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    description: str
    timestamp: str
    read: bool
    action: Optional[str] = None

    class Config:
        from_attributes = True
