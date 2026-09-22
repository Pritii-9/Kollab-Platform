from typing import Optional
from pydantic import BaseModel, EmailStr

class LoginCredentials(BaseModel):
    email: str
    password: str

class RegisterStep1(BaseModel):
    name: str
    email: EmailStr
    department: str
    year: str
    batch: str
    roll_number: str

class RegisterStep2(BaseModel):
    email: EmailStr
    otp: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    department: Optional[str] = None
    year: Optional[int] = None
    batch: Optional[str] = None
    rollNumber: Optional[str] = None
    avatar: Optional[str] = None
    token: Optional[str] = None
    trustScore: Optional[int] = 70
    placementStatus: Optional[str] = "Eligible"

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
