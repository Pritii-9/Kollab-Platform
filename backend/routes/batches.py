from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.batch import Batch
from models.user import User
from schemas.batch import BatchCreate, BatchUpdate, BatchResponse
from utils.jwt import get_current_user, require_coordinator

router = APIRouter(prefix="/batches", tags=["Batches"])

@router.get("", response_model=List[BatchResponse])
async def list_batches(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Batch).order_by(Batch.created_at.desc()))
    batches = result.scalars().all()
    return [
        BatchResponse(
            id=b.id,
            name=b.name,
            department=b.department,
            year=b.year,
            section=b.section,
            coordinator=b.coordinator,
            academicYear=b.academic_year,
            totalStudents=b.total_students,
            skillVerified=b.skill_verified,
            activeProjects=b.active_projects,
            placementReady=b.placement_ready,
            readinessPercent=b.readiness_percent,
            status=b.status
        ) for b in batches
    ]

@router.post("", response_model=BatchResponse)
async def create_batch(
    data: BatchCreate,
    current_user: User = Depends(require_coordinator),
    db: AsyncSession = Depends(get_db)
):
    name = data.name or f"{data.department} - Year {data.year} ({data.section})"
    new_batch = Batch(
        name=name,
        department=data.department,
        year=data.year,
        section=data.section,
        coordinator=data.coordinator or current_user.name,
        academic_year=data.academic_year or "2025-2026",
        total_students=40,
        skill_verified=0,
        active_projects=0,
        placement_ready=0,
        readiness_percent=0,
        status="Active"
    )
    db.add(new_batch)
    await db.commit()
    await db.refresh(new_batch)

    return BatchResponse(
        id=new_batch.id,
        name=new_batch.name,
        department=new_batch.department,
        year=new_batch.year,
        section=new_batch.section,
        coordinator=new_batch.coordinator,
        academicYear=new_batch.academic_year,
        totalStudents=new_batch.total_students,
        skillVerified=new_batch.skill_verified,
        activeProjects=new_batch.active_projects,
        placementReady=new_batch.placement_ready,
        readinessPercent=new_batch.readiness_percent,
        status=new_batch.status
    )

@router.delete("/{batch_id}")
async def delete_batch(
    batch_id: str,
    current_user: User = Depends(require_coordinator),
    db: AsyncSession = Depends(get_db)
):
    await db.execute(delete(Batch).filter(Batch.id == batch_id))
    await db.commit()
    return {"message": "Batch deleted"}
