from typing import Optional, List
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from models.user import User
from models.skill import StudentSkill
from models.review import PeerReview
from models.analytics import TimelineEvent
from schemas.student import (
    StudentDetailResponse,
    StudentCardResponse,
    StudentProfileUpdate,
    SkillItemSchema,
    PeerReviewSchema,
    TimelineEventSchema,
    AvailabilitySchema
)

class StudentService:
    @staticmethod
    async def get_students_roster(
        db: AsyncSession,
        search: Optional[str] = None,
        year: Optional[int] = None,
        batch: Optional[str] = None,
        placement_status: Optional[str] = None
    ) -> List[StudentDetailResponse]:
        query = select(User).filter(User.role == "student").options(
            selectinload(User.skills),
            selectinload(User.reviews_received),
            selectinload(User.timeline_events)
        )

        if year and year != 0:
            query = query.filter(User.year == year)
        if batch and batch != "all":
            query = query.filter(User.batch == batch)
        if placement_status and placement_status != "all":
            query = query.filter(User.placement_status == placement_status)
        if search:
            query = query.filter(
                or_(
                    User.name.ilike(f"%{search}%"),
                    User.roll_number.ilike(f"%{search}%"),
                    User.department.ilike(f"%{search}%")
                )
            )

        result = await db.execute(query)
        students = result.scalars().all()

        responses = []
        for s in students:
            skills = [
                SkillItemSchema(
                    id=sk.id,
                    name=sk.name,
                    status=sk.status,
                    score=sk.score,
                    lastTested=sk.last_tested
                ) for sk in s.skills
            ]
            reviews = [
                PeerReviewSchema(
                    id=r.id,
                    reviewerId=r.reviewer_id,
                    reviewerName=r.reviewer_name,
                    reviewerAvatar=r.reviewer_avatar or "",
                    projectName=r.project_name,
                    rating=r.rating,
                    comment=r.comment,
                    date=r.date
                ) for r in s.reviews_received
            ]
            responses.append(StudentDetailResponse(
                id=s.id,
                name=s.name,
                email=s.email,
                rollNumber=s.roll_number or "N/A",
                department=s.department or "Computer Science & Engineering",
                year=s.year if s.year is not None else 4,
                batch=s.batch or "Batch B",
                cgpa=s.cgpa or 8.5,
                avatar=s.avatar,
                trustScore=s.trust_score if s.trust_score is not None else 85,
                placementStatus=s.placement_status or "Eligible",
                skills=skills,
                github=s.github,
                linkedin=s.linkedin,
                bio=s.bio,
                reviews=reviews,
                availability=AvailabilitySchema(openToProjects=True, preferredRoles=["Fullstack", "Frontend"]),
                testsCompleted=len([sk for sk in s.skills if sk.status == "verified"]),
                projectsJoined=0,
                joinedAt=s.created_at.strftime("%Y-%m-%d") if s.created_at else "2024-08-01"
            ))
        return responses

    @staticmethod
    async def get_student_cards(
        db: AsyncSession,
        search: Optional[str] = None,
        skill: Optional[str] = None,
        year: Optional[int] = None,
        current_student_id: Optional[str] = None
    ) -> List[StudentCardResponse]:
        query = select(User).filter(User.role == "student").options(selectinload(User.skills))

        if current_student_id:
            query = query.filter(User.id != current_student_id)
        if year and year != 0:
            query = query.filter(User.year == year)
        if search:
            query = query.filter(User.name.ilike(f"%{search}%"))

        result = await db.execute(query)
        students = result.scalars().all()

        cards = []
        for s in students:
            skill_names = [sk.name for sk in s.skills]
            if skill and skill.lower() not in [sn.lower() for sn in skill_names]:
                continue

            match_pct = min(98, max(65, int(((s.trust_score or 85) * 0.6) + (len(skill_names) * 7))))

            cards.append(StudentCardResponse(
                id=s.id,
                name=s.name,
                avatar=s.avatar,
                batch=s.batch or "Batch B",
                year=s.year if s.year is not None else 4,
                department=s.department or "Computer Science & Engineering",
                trustScore=s.trust_score if s.trust_score is not None else 85,
                matchPercentage=match_pct,
                skills=skill_names,
                cgpa=s.cgpa or 8.5,
                placementStatus=s.placement_status or "Eligible"
            ))
        return cards

    @staticmethod
    async def get_student_by_id(student_id: str, db: AsyncSession) -> StudentDetailResponse:
        result = await db.execute(
            select(User)
            .filter(User.id == student_id)
            .options(
                selectinload(User.skills),
                selectinload(User.reviews_received),
                selectinload(User.timeline_events)
            )
        )
        s = result.scalars().first()
        if not s:
            raise HTTPException(status_code=404, detail="Student not found")

        skills = [
            SkillItemSchema(
                id=sk.id,
                name=sk.name,
                status=sk.status,
                score=sk.score,
                lastTested=sk.last_tested
            ) for sk in s.skills
        ]
        reviews = [
            PeerReviewSchema(
                id=r.id,
                reviewerId=r.reviewer_id,
                reviewerName=r.reviewer_name,
                reviewerAvatar=r.reviewer_avatar or "",
                projectName=r.project_name,
                rating=r.rating,
                comment=r.comment,
                date=r.date
            ) for r in s.reviews_received
        ]
        return StudentDetailResponse(
            id=s.id,
            name=s.name,
            email=s.email,
            rollNumber=s.roll_number or "N/A",
            department=s.department or "Computer Science & Engineering",
            year=s.year if s.year is not None else 4,
            batch=s.batch or "Batch B",
            cgpa=s.cgpa or 8.5,
            avatar=s.avatar,
            trustScore=s.trust_score if s.trust_score is not None else 85,
            placementStatus=s.placement_status or "Eligible",
            skills=skills,
            github=s.github,
            linkedin=s.linkedin,
            bio=s.bio,
            reviews=reviews,
            availability=AvailabilitySchema(openToProjects=True, preferredRoles=["Fullstack", "Frontend"]),
            testsCompleted=len([sk for sk in s.skills if sk.status == "verified"]),
            projectsJoined=0,
            joinedAt=s.created_at.strftime("%Y-%m-%d") if s.created_at else "2024-08-01"
        )

    @staticmethod
    async def get_student_timeline(student_id: str, db: AsyncSession) -> List[TimelineEventSchema]:
        result = await db.execute(
            select(TimelineEvent)
            .filter(TimelineEvent.student_id == student_id)
            .order_by(TimelineEvent.year.asc())
        )
        events = result.scalars().all()
        return [
            TimelineEventSchema(
                id=e.id,
                year=e.year,
                title=e.title,
                description=e.description,
                date=e.date,
                status=e.status,
                type=e.type
            ) for e in events
        ]

    @staticmethod
    async def update_profile(student_id: str, updates: StudentProfileUpdate, db: AsyncSession) -> StudentDetailResponse:
        result = await db.execute(select(User).filter(User.id == student_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="Student not found")

        if updates.name is not None:
            user.name = updates.name
        if updates.bio is not None:
            user.bio = updates.bio
        if updates.github is not None:
            user.github = updates.github
        if updates.linkedin is not None:
            user.linkedin = updates.linkedin
        if updates.cgpa is not None:
            user.cgpa = updates.cgpa
        if updates.department is not None:
            user.department = updates.department

        await db.commit()
        return await StudentService.get_student_by_id(student_id, db)
