from typing import Optional, List
from pydantic import BaseModel

class SkillItemSchema(BaseModel):
    id: str
    name: str
    status: str  # 'verified' | 'pending' | 'failed'
    score: int
    lastTested: Optional[str] = None

    class Config:
        from_attributes = True

class PeerReviewSchema(BaseModel):
    id: str
    reviewerId: str
    reviewerName: str
    reviewerAvatar: Optional[str] = ""
    projectName: str
    rating: int
    comment: str
    date: str

    class Config:
        from_attributes = True

class AvailabilitySchema(BaseModel):
    openToProjects: bool = True
    preferredRoles: List[str] = ["Frontend", "Fullstack"]

class StudentDetailResponse(BaseModel):
    id: str
    name: str
    email: str
    rollNumber: str
    department: str
    year: int
    batch: str
    cgpa: float
    avatar: Optional[str] = None
    trustScore: int
    placementStatus: str
    skills: List[SkillItemSchema] = []
    github: Optional[str] = None
    linkedin: Optional[str] = None
    bio: Optional[str] = None
    reviews: List[PeerReviewSchema] = []
    availability: AvailabilitySchema = AvailabilitySchema()
    testsCompleted: int = 0
    projectsJoined: int = 0
    joinedAt: str = ""

    class Config:
        from_attributes = True

class StudentCardResponse(BaseModel):
    id: str
    name: str
    avatar: Optional[str] = None
    batch: str
    year: int
    department: str
    trustScore: int
    matchPercentage: int = 85
    skills: List[str] = []
    cgpa: float
    placementStatus: str

    class Config:
        from_attributes = True

class StudentProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    department: Optional[str] = None
    cgpa: Optional[float] = None

class TimelineEventSchema(BaseModel):
    id: str
    year: int
    title: str
    description: str
    date: str
    status: str
    type: str

    class Config:
        from_attributes = True
