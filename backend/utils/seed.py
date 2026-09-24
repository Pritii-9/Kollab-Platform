import json
import logging
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User
from models.batch import Batch
from models.skill import StudentSkill
from models.project import Project, ProjectMember, Task, Milestone
from models.test import Test, Question, QuestionOption, TestAttempt
from models.review import PeerReview
from models.analytics import Notification, Announcement, TimelineEvent
from utils.jwt import get_password_hash

logger = logging.getLogger(__name__)

async def seed_database(session: AsyncSession):
    from sqlalchemy import delete
    # Remove any non-CSE legacy batches
    valid_batch_names = ["CSE Batch A", "CSE Batch B", "CSE Batch C"]
    await session.execute(
        delete(Batch).where(Batch.name.not_in(valid_batch_names))
    )

    # Check existing batches
    existing_batches = (await session.execute(select(Batch))).scalars().all()
    existing_names = {b.name for b in existing_batches}

    batches_data = [
        {"id": "b-cse-a", "name": "CSE Batch A", "department": "CSE", "year": 4, "section": "Batch A", "coordinator": "Dr. Ravi Shankar", "academic_year": "2025-26", "total_students": 0, "skill_verified": 0, "active_projects": 0, "placement_ready": 0, "readiness_percent": 0, "status": "Active"},
        {"id": "b-cse-b", "name": "CSE Batch B", "department": "CSE", "year": 4, "section": "Batch B", "coordinator": "Prof. Sarah Jenkins", "academic_year": "2025-26", "total_students": 1, "skill_verified": 4, "active_projects": 1, "placement_ready": 1, "readiness_percent": 92, "status": "Active"},
        {"id": "b-cse-c", "name": "CSE Batch C", "department": "CSE", "year": 4, "section": "Batch C", "coordinator": "Dr. Meena Iyer", "academic_year": "2025-26", "total_students": 0, "skill_verified": 0, "active_projects": 0, "placement_ready": 0, "readiness_percent": 0, "status": "Active"},
    ]
    for b in batches_data:
        if b["name"] not in existing_names:
            session.add(Batch(**b))

    # Check if coordinator and student Priti Jadhav exist
    user_check = await session.execute(select(User).limit(1))
    if user_check.scalars().first():
        await session.commit()
        logger.info("Batches synced. Database ready.")
        return

    logger.info("Seeding database with real platform structure (Priti Jadhav in CSE Batch B)...")
    pwd_hash = get_password_hash("password123")

    # 1. Seed System Coordinator
    coordinator = User(
        id="coord1",
        name="Prof. Sarah Jenkins",
        email="coordinator@college.edu",
        password_hash=pwd_hash,
        role="coordinator",
        department="Computer Science & Engineering",
        avatar="",
        is_active=True
    )
    session.add(coordinator)

    # 2. Seed Real Student: Priti Jadhav in Year 4 CSE Batch B
    priti_student = User(
        id="student-priti",
        name="Priti Jadhav",
        email="priti@college.edu",
        password_hash=pwd_hash,
        role="student",
        department="Computer Science & Engineering",
        year=4,
        batch="CSE Batch B",
        roll_number="CSE21001",
        cgpa=8.9,
        trust_score=92,
        placement_status="Eligible",
        bio="Full stack & ML developer. Passionate about web platform architecture.",
        github="github.com/Pritii-9",
        linkedin="linkedin.com/in/priti-jadhav",
        is_active=True
    )
    session.add(priti_student)
    await session.flush()

    # Seed verified skills for Priti
    skills_priti = [
        ("React", "verified", 92),
        ("Node.js", "verified", 88),
        ("Python", "verified", 90),
        ("FastAPI", "verified", 86)
    ]
    for sname, sstatus, sscore in skills_priti:
        sk = StudentSkill(
            student_id=priti_student.id,
            name=sname,
            status=sstatus,
            score=sscore,
            last_tested="2026-03-10"
        )
        session.add(sk)

    # 3. Seed Department Batches: CSE Batch A, CSE Batch B (Priti), CSE Batch C
    batches_data = [
        {"id": "b-cse-a", "name": "CSE Batch A", "department": "CSE", "year": 4, "section": "Batch A", "coordinator": "Dr. Ravi Shankar", "academic_year": "2025-26", "total_students": 0, "skill_verified": 0, "active_projects": 0, "placement_ready": 0, "readiness_percent": 0, "status": "Active"},
        {"id": "b-cse-b", "name": "CSE Batch B", "department": "CSE", "year": 4, "section": "Batch B", "coordinator": "Prof. Sarah Jenkins", "academic_year": "2025-26", "total_students": 1, "skill_verified": 1, "active_projects": 1, "placement_ready": 1, "readiness_percent": 92, "status": "Active"},
        {"id": "b-cse-c", "name": "CSE Batch C", "department": "CSE", "year": 4, "section": "Batch C", "coordinator": "Dr. Meena Iyer", "academic_year": "2025-26", "total_students": 0, "skill_verified": 0, "active_projects": 0, "placement_ready": 0, "readiness_percent": 0, "status": "Active"},
    ]
    for b in batches_data:
        session.add(Batch(**b))

    # 4. Seed React Test Structure
    test1 = Test(
        id="test-react-adv",
        title="React.js Advanced Proctored Test",
        skill_name="React",
        difficulty="Medium",
        time_limit=30,
        attempts=2,
        randomize_questions=True,
        randomize_options=True,
        tab_detection=True,
        fullscreen_lock=True,
        assigned_to="all",
        target_batch="CSE Batch B",
        due_date="2026-09-30",
        created_by="Prof. Sarah Jenkins"
    )
    session.add(test1)

    q1 = Question(
        id="q1",
        test_id="test-react-adv",
        text="What is the primary benefit of React Virtual DOM reconciliation algorithm?",
        topic="Virtual DOM",
        difficulty="Medium",
        explanation="Virtual DOM computes lightweight diffs in memory before committing changes to the real browser DOM, minimizing expensive layout recalculations."
    )
    session.add(q1)

    options_data = [
        {"question_id": "q1", "text": "Directly mutates real DOM nodes synchronously", "is_correct": False},
        {"question_id": "q1", "text": "Minimizes costly DOM manipulations by computing lightweight diffs", "is_correct": True},
        {"question_id": "q1", "text": "Compiles React components directly into native WebAssembly", "is_correct": False},
        {"question_id": "q1", "text": "Replaces the browser rendering engine with Node.js V8", "is_correct": False},
    ]
    for opt in options_data:
        session.add(QuestionOption(**opt))

    await session.commit()
    logger.info("Database seeding successfully completed for CSE Batches A, B (Priti Jadhav), C!")
