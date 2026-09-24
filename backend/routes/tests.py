from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.user import User
from schemas.test import (
    TestCreate,
    TestResponse,
    TestSubmitRequest,
    TestResultResponse,
    TestAttemptResponse
)
from services.test_service import TestService
from utils.jwt import get_current_user, require_coordinator

router = APIRouter(prefix="/tests", tags=["Tests & Proctoring"])

@router.get("", response_model=List[TestResponse])
async def list_tests(db: AsyncSession = Depends(get_db)):
    return await TestService.list_tests(db)

@router.post("", response_model=TestResponse)
async def create_and_assign_test(
    data: TestCreate,
    current_user: User = Depends(require_coordinator),
    db: AsyncSession = Depends(get_db)
):
    return await TestService.create_test(data, current_user.name, db)

@router.get("/attempts", response_model=List[TestAttemptResponse])
async def get_all_attempts(
    test_id: Optional[str] = Query(None),
    current_user: User = Depends(require_coordinator),
    db: AsyncSession = Depends(get_db)
):
    return await TestService.get_all_attempts(db, test_id=test_id)

@router.get("/my-attempts", response_model=List[TestResultResponse])
async def get_my_attempts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await TestService.get_student_attempts(current_user.id, db)

@router.get("/{test_id}", response_model=TestResponse)
async def get_test(test_id: str, db: AsyncSession = Depends(get_db)):
    return await TestService.get_test_by_id(test_id, db, include_answers=False)

@router.get("/{test_id}/attempts", response_model=List[TestAttemptResponse])
async def get_test_attempts(
    test_id: str,
    current_user: User = Depends(require_coordinator),
    db: AsyncSession = Depends(get_db)
):
    return await TestService.get_all_attempts(db, test_id=test_id)

@router.post("/{test_id}/submit", response_model=TestResultResponse)
async def submit_test(
    test_id: str,
    data: TestSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await TestService.submit_test(test_id, current_user, data, db)

