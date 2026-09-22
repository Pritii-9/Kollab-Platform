from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.user import User
from schemas.auth import (
    LoginCredentials,
    RegisterStep1,
    RegisterStep2,
    TokenResponse,
    UserResponse,
    ChangePasswordRequest
)
from services.auth_service import AuthService
from utils.jwt import get_current_user, get_password_hash, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginCredentials, db: AsyncSession = Depends(get_db)):
    return await AuthService.login_user(credentials, db)

@router.post("/register-step1")
async def register_step1(data: RegisterStep1, db: AsyncSession = Depends(get_db)):
    return await AuthService.request_registration_otp(data, db)

@router.post("/verify-otp-register", response_model=TokenResponse)
async def verify_otp_register(
    data: RegisterStep2,
    name: str = "Student",
    department: str = "Computer Science & Engineering",
    year: str = "3",
    batch: str = "Batch A",
    roll_number: str = "CSE21001",
    db: AsyncSession = Depends(get_db)
):
    step1 = RegisterStep1(
        name=name,
        email=data.email,
        department=department,
        year=year,
        batch=batch,
        roll_number=roll_number
    )
    return await AuthService.verify_otp_and_register(data, step1, db)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        department=current_user.department,
        year=current_user.year,
        batch=current_user.batch,
        rollNumber=current_user.roll_number,
        trustScore=current_user.trust_score,
        placementStatus=current_user.placement_status
    )

@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.password_hash = get_password_hash(data.new_password)
    await db.commit()
    return {"message": "Password updated successfully"}
