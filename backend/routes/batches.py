from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.batch import Batch
from models.user import User
from schemas.batch import BatchCreate, BatchUpdate, BatchResponse
from utils.jwt import get_current_user, require_coordinator

from sqlalchemy.orm import selectinload
from models.project import Project

router = APIRouter(prefix="/batches", tags=["Batches"])

@router.get("", response_model=List[BatchResponse])
async def list_batches(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Batch).order_by(Batch.name.asc()))
    batches = result.scalars().all()

    # If no batches exist, create default CSE Batches A, B, C
    if not batches:
        default_batches = [
            {"id": "b-cse-a", "name": "CSE Batch A", "department": "CSE", "year": 4, "section": "Batch A", "coordinator": "Dr. Ravi Shankar", "academic_year": "2025-2026", "status": "Active"},
            {"id": "b-cse-b", "name": "CSE Batch B", "department": "CSE", "year": 4, "section": "Batch B", "coordinator": "Prof. Sarah Jenkins", "academic_year": "2025-2026", "status": "Active"},
            {"id": "b-cse-c", "name": "CSE Batch C", "department": "CSE", "year": 4, "section": "Batch C", "coordinator": "Dr. Meena Iyer", "academic_year": "2025-2026", "status": "Active"},
        ]
        for b in default_batches:
            db.add(Batch(**b))
        await db.commit()
        result = await db.execute(select(Batch).order_by(Batch.name.asc()))
        batches = result.scalars().all()

    # Fetch all students with skills loaded
    students_res = await db.execute(
        select(User)
        .filter(User.role == "student")
        .options(selectinload(User.skills))
    )
    all_students = students_res.scalars().all()

    # Fetch active projects
    projects_res = await db.execute(select(Project).filter(Project.status == "Active"))
    active_projects_count = len(projects_res.scalars().all())

    response_list = []
    for b in batches:
        # Match students belonging to this batch (e.g. "CSE Batch B", "Batch B", "B")
        batch_students = [
            s for s in all_students
            if s.batch and (
                s.batch.strip().lower() == b.name.strip().lower()
                or s.batch.strip().lower() == b.section.strip().lower()
                or b.name.lower().endswith(s.batch.strip().lower())
                or s.batch.lower().endswith(b.section.strip().lower())
            )
        ]

        total_students = len(batch_students)
        skill_verified = sum(
            len([sk for sk in s.skills if sk.status == "verified"])
            for s in batch_students
        )
        placement_ready = len([
            s for s in batch_students
            if s.placement_status in ("Eligible", "Placed")
        ])

        if total_students > 0:
            avg_readiness = int(sum(s.trust_score or 85 for s in batch_students) / total_students)
            b_projects = active_projects_count
        else:
            avg_readiness = 0
            b_projects = 0

        response_list.append(BatchResponse(
            id=b.id,
            name=b.name,
            department=b.department,
            year=b.year,
            section=b.section,
            coordinator=b.coordinator,
            academicYear=b.academic_year,
            totalStudents=total_students,
            skillVerified=skill_verified,
            activeProjects=b_projects,
            placementReady=placement_ready,
            readinessPercent=avg_readiness,
            status=b.status
        ))

    return response_list

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
