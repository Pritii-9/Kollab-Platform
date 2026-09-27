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

def is_department_match(student_dept: str, batch_dept: str, batch_name: str) -> bool:
    if not student_dept:
        return True
    sd = student_dept.strip().lower()
    bd = batch_dept.strip().lower()
    bn = batch_name.strip().lower()

    if "computer" in sd or "cse" in sd:
        return "cse" in bd or "computer" in bd or "cse" in bn or "computer" in bn
    if "information" in sd or "it" in sd:
        return "it" in bd or "information" in bd or "it" in bn or "information" in bn
    if "data" in sd or "aids" in sd or "ai&ds" in sd:
        return "aids" in bd or "ai&ds" in bd or "data" in bd or "aids" in bn or "ai&ds" in bn
    if "machine" in sd or "aiml" in sd:
        return "aiml" in bd or "machine" in bd or "aiml" in bn
    return sd in bd or bd in sd or sd in bn

def is_section_match(student_batch: str, batch_sec: str, batch_name: str) -> bool:
    if not student_batch:
        return False
    sb = student_batch.strip().lower()
    sec = batch_sec.strip().lower()
    bn = batch_name.strip().lower()

    return sb == sec or sb in bn or bn.endswith(sb) or sb.endswith(sec)

@router.get("", response_model=List[BatchResponse])
async def list_batches(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Batch).order_by(Batch.name.asc()))
    batches = result.scalars().all()

    # If no batches exist, create clean IT and CSE default batches
    if not batches:
        default_batches = [
            {"id": "b-it-a", "name": "IT Batch A", "department": "IT", "year": 4, "section": "Batch A", "coordinator": "Prof. Sarah Jenkins", "academic_year": "2025-2026", "status": "Active"},
            {"id": "b-it-b", "name": "IT Batch B", "department": "IT", "year": 4, "section": "Batch B", "coordinator": "Prof. Sarah Jenkins", "academic_year": "2025-2026", "status": "Active"},
            {"id": "b-it-c", "name": "IT Batch C", "department": "IT", "year": 4, "section": "Batch C", "coordinator": "Prof. Sarah Jenkins", "academic_year": "2025-2026", "status": "Active"},
            {"id": "b-cse-a", "name": "CSE Batch A", "department": "CSE", "year": 4, "section": "Batch A", "coordinator": "Dr. Ravi Shankar", "academic_year": "2025-2026", "status": "Active"},
            {"id": "b-cse-b", "name": "CSE Batch B", "department": "CSE", "year": 4, "section": "Batch B", "coordinator": "Prof. Sarah Jenkins", "academic_year": "2025-2026", "status": "Active"},
            {"id": "b-cse-c", "name": "CSE Batch C", "department": "CSE", "year": 4, "section": "Batch C", "coordinator": "Dr. Meena Iyer", "academic_year": "2025-2026", "status": "Active"},
        ]
        for b in default_batches:
            db.add(Batch(**b))
        await db.commit()
        result = await db.execute(select(Batch).order_by(Batch.name.asc()))
        batches = result.scalars().all()

    # Migrate legacy batch names in DB if present
    db_updated = False
    for b in batches:
        if "Information Technology" in b.name:
            b.name = b.name.replace("Information Technology - Year 4 (", "IT ").replace(")", "")
            b.department = "IT"
            db.add(b)
            db_updated = True
        elif "Computer Science" in b.name:
            b.name = b.name.replace("Computer Science & Engineering - Year 4 (", "CSE ").replace(")", "")
            b.department = "CSE"
            db.add(b)
            db_updated = True
    if db_updated:
        await db.commit()

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
        # Strict matching: department AND section MUST match!
        batch_students = [
            s for s in all_students
            if is_department_match(s.department or "", b.department, b.name)
            and is_section_match(s.batch or "", b.section, b.name)
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
    clean_sec = data.section if data.section.startswith("Batch ") else f"Batch {data.section}"
    name = data.name or f"{data.department} {clean_sec}"
    new_batch = Batch(
        name=name,
        department=data.department,
        year=data.year,
        section=clean_sec,
        coordinator=data.coordinator or current_user.name or "Prof. Sarah Jenkins",
        academic_year=data.academic_year or "2025-2026",
        total_students=0,
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
        totalStudents=0,
        skillVerified=0,
        activeProjects=0,
        placementReady=0,
        readinessPercent=0,
        status=new_batch.status
    )

@router.put("/{batch_id}", response_model=BatchResponse)
async def update_batch(
    batch_id: str,
    data: BatchUpdate,
    current_user: User = Depends(require_coordinator),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Batch).filter(Batch.id == batch_id))
    batch = result.scalars().first()
    if not batch:
        raise HTTPException(status_code=444, detail="Batch not found")

    if data.name:
        batch.name = data.name
    if data.coordinator:
        batch.coordinator = data.coordinator
    if data.status:
        batch.status = data.status
    if data.readiness_percent is not None:
        batch.readiness_percent = data.readiness_percent

    await db.commit()
    await db.refresh(batch)

    # Calculate actual counts
    students_res = await db.execute(
        select(User)
        .filter(User.role == "student")
        .options(selectinload(User.skills))
    )
    all_students = students_res.scalars().all()
    batch_students = [
        s for s in all_students
        if is_department_match(s.department or "", batch.department, batch.name)
        and is_section_match(s.batch or "", batch.section, batch.name)
    ]

    total_students = len(batch_students)
    skill_verified = sum(len([sk for sk in s.skills if sk.status == "verified"]) for s in batch_students)

    return BatchResponse(
        id=batch.id,
        name=batch.name,
        department=batch.department,
        year=batch.year,
        section=batch.section,
        coordinator=batch.coordinator,
        academicYear=batch.academic_year,
        totalStudents=total_students,
        skillVerified=skill_verified,
        activeProjects=batch.active_projects,
        placementReady=batch.placement_ready,
        readinessPercent=batch.readiness_percent,
        status=batch.status
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

