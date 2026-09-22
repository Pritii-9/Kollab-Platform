from typing import Optional
from pydantic import BaseModel

class BatchCreate(BaseModel):
    name: Optional[str] = None
    department: str
    year: int
    section: str
    coordinator: Optional[str] = "Prof. Sarah Jenkins"
    academic_year: Optional[str] = "2025-2026"

class BatchUpdate(BaseModel):
    name: Optional[str] = None
    coordinator: Optional[str] = None
    status: Optional[str] = None
    readiness_percent: Optional[int] = None

class BatchResponse(BaseModel):
    id: str
    name: str
    department: str
    year: int
    section: str
    coordinator: str
    academicYear: str
    totalStudents: int
    skillVerified: int
    activeProjects: int
    placementReady: int
    readinessPercent: int
    status: str

    class Config:
        from_attributes = True
