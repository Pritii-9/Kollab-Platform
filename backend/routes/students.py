from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.user import User
from schemas.student import (
    StudentDetailResponse,
    StudentCardResponse,
    StudentProfileUpdate,
    TimelineEventSchema
)
from services.student_service import StudentService
from utils.jwt import get_current_user

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("", response_model=List[StudentDetailResponse])
async def list_students(
    search: Optional[str] = None,
    year: Optional[int] = None,
    batch: Optional[str] = None,
    placement_status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    return await StudentService.get_students_roster(db, search, year, batch, placement_status)

@router.get("/teammates", response_model=List[StudentCardResponse])
async def find_teammates(
    search: Optional[str] = None,
    skill: Optional[str] = None,
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await StudentService.get_student_cards(db, search, skill, year, current_user.id)

@router.get("/me/profile", response_model=StudentDetailResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await StudentService.get_student_by_id(current_user.id, db)

@router.put("/me/profile", response_model=StudentDetailResponse)
async def update_my_profile(
    updates: StudentProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await StudentService.update_profile(current_user.id, updates, db)

@router.get("/{student_id}", response_model=StudentDetailResponse)
async def get_student_by_id(student_id: str, db: AsyncSession = Depends(get_db)):
    return await StudentService.get_student_by_id(student_id, db)

@router.get("/{student_id}/timeline", response_model=List[TimelineEventSchema])
async def get_student_timeline(student_id: str, db: AsyncSession = Depends(get_db)):
    return await StudentService.get_student_timeline(student_id, db)
