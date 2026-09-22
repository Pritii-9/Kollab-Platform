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
    # Check if data already exists
    user_check = await session.execute(select(User).limit(1))
    if user_check.scalars().first():
        logger.info("Database already seeded.")
        return

    logger.info("Seeding database with initial platform data...")
    pwd_hash = get_password_hash("password123")

    # 1. Seed Coordinator
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

    # 2. Seed Students
    students_data = [
        {
            "id": "s1", "name": "Aanya Sharma", "email": "aanya@college.edu",
            "roll_number": "CSE21001", "department": "Computer Science & Engineering",
            "year": 3, "batch": "Batch A", "cgpa": 8.9, "trust_score": 92, "placement_status": "Eligible",
            "bio": "Full stack developer passionate about scalable web applications.",
            "github": "github.com/aanya", "linkedin": "linkedin.com/in/aanya",
            "skills": [
                ("React", "verified", 88), ("Node.js", "verified", 82),
                ("Python", "pending", 65), ("MongoDB", "verified", 79)
            ]
        },
        {
            "id": "s2", "name": "Rohan Mehta", "email": "rohan@college.edu",
            "roll_number": "CSE21002", "department": "Computer Science & Engineering",
            "year": 3, "batch": "Batch A", "cgpa": 8.2, "trust_score": 78, "placement_status": "Eligible",
            "bio": "Data science enthusiast.", "github": "github.com/rohan", "linkedin": "",
            "skills": [("Python", "verified", 91), ("ML", "verified", 85), ("React", "pending", 60)]
        },
        {
            "id": "s3", "name": "Priya Nair", "email": "priya@college.edu",
            "roll_number": "CSE22001", "department": "Computer Science & Engineering",
            "year": 2, "batch": "Batch B", "cgpa": 9.1, "trust_score": 95, "placement_status": "Eligible",
            "bio": "TypeScript enthusiast and open source contributor.", "github": "github.com/priya", "linkedin": "linkedin.com/in/priya",
            "skills": [("TypeScript", "verified", 94), ("React", "verified", 90), ("AWS", "verified", 72)]
        },
        {
            "id": "s4", "name": "Arjun Singh", "email": "arjun@college.edu",
            "roll_number": "CSE20001", "department": "Computer Science & Engineering",
            "year": 4, "batch": "Batch C", "cgpa": 7.8, "trust_score": 68, "placement_status": "In Process",
            "bio": "Backend Java developer.", "github": "github.com/arjun", "linkedin": "",
            "skills": [("Java", "verified", 80), ("Spring Boot", "pending", 55), ("Docker", "failed", 40)]
        },
        {
            "id": "s5", "name": "Sneha Patel", "email": "sneha@college.edu",
            "roll_number": "IT21003", "department": "Information Technology",
            "year": 3, "batch": "Batch A", "cgpa": 8.5, "trust_score": 84, "placement_status": "Eligible",
            "bio": "Mobile dev, flutter lover.", "github": "github.com/sneha", "linkedin": "linkedin.com/in/sneha",
            "skills": [("Flutter", "verified", 88), ("Firebase", "verified", 82), ("Dart", "pending", 70)]
        },
        {
            "id": "s6", "name": "Karan Verma", "email": "karan@college.edu",
            "roll_number": "CSE23001", "department": "Computer Science & Engineering",
            "year": 1, "batch": "Batch B", "cgpa": 7.5, "trust_score": 52, "placement_status": "Ineligible",
            "bio": "First year CSE student learning the ropes.", "github": "", "linkedin": "",
            "skills": [("Python", "pending", 45), ("Git", "verified", 70)]
        },
        {
            "id": "s7", "name": "Divya Reddy", "email": "divya@college.edu",
            "roll_number": "EC21002", "department": "Electronics & Communication",
            "year": 3, "batch": "Batch A", "cgpa": 8.0, "trust_score": 73, "placement_status": "Eligible",
            "bio": "IoT + ML enthusiast.", "github": "github.com/divya", "linkedin": "",
            "skills": [("Python", "verified", 76), ("ML", "pending", 61), ("Data Structures", "verified", 83)]
        },
        {
            "id": "s8", "name": "Vikram Joshi", "email": "vikram@college.edu",
            "roll_number": "CSE20002", "department": "Computer Science & Engineering",
            "year": 4, "batch": "Batch A", "cgpa": 9.3, "trust_score": 97, "placement_status": "Placed",
            "bio": "SWE @ Google. Loves distributed systems.", "github": "github.com/vikram", "linkedin": "linkedin.com/in/vikram",
            "skills": [("System Design", "verified", 96), ("Go", "verified", 90), ("Kubernetes", "verified", 85), ("PostgreSQL", "verified", 88)]
        },
        {
            "id": "s9", "name": "Neha Gupta", "email": "neha@college.edu",
            "roll_number": "IT22002", "department": "Information Technology",
            "year": 2, "batch": "Batch C", "cgpa": 7.9, "trust_score": 61, "placement_status": "Eligible",
            "bio": "Learning React and web development.", "github": "", "linkedin": "",
            "skills": [("React", "pending", 58), ("JavaScript", "verified", 74)]
        },
        {
            "id": "s10", "name": "Rahul Das", "email": "rahul@college.edu",
            "roll_number": "CSE22003", "department": "Computer Science & Engineering",
            "year": 2, "batch": "Batch A", "cgpa": 8.4, "trust_score": 80, "placement_status": "Eligible",
            "bio": "MERN stack developer.", "github": "github.com/rahul", "linkedin": "linkedin.com/in/rahul",
            "skills": [("Node.js", "verified", 81), ("MongoDB", "verified", 77), ("Express", "verified", 79)]
        },
        {
            "id": "s11", "name": "Ananya Krishnan", "email": "ananya@college.edu",
            "roll_number": "CSE21004", "department": "Computer Science & Engineering",
            "year": 3, "batch": "Batch B", "cgpa": 8.7, "trust_score": 88, "placement_status": "Eligible",
            "bio": "UI/UX Designer + Frontend dev.", "github": "github.com/ananya", "linkedin": "linkedin.com/in/ananya",
            "skills": [("Figma", "verified", 90), ("React", "verified", 86), ("CSS", "verified", 92)]
        },
        {
            "id": "s12", "name": "Dev Malhotra", "email": "dev@college.edu",
            "roll_number": "CSE20003", "department": "Computer Science & Engineering",
            "year": 4, "batch": "Batch B", "cgpa": 8.1, "trust_score": 75, "placement_status": "In Process",
            "bio": "Cloud + DevOps engineer.", "github": "github.com/dev", "linkedin": "linkedin.com/in/dev",
            "skills": [("AWS", "verified", 83), ("Docker", "verified", 79), ("Python", "verified", 75)]
        },
    ]

    for sd in students_data:
        skills_info = sd.pop("skills")
        student_user = User(
            password_hash=pwd_hash,
            role="student",
            is_active=True,
            **sd
        )
        session.add(student_user)
    await session.flush()

    for sd, skills_info in [(s, s.get("skills_cached", [])) for s in students_data]:
        pass

    # Add skills for students
    skills_map = {
        "s1": [("React", "verified", 88), ("Node.js", "verified", 82), ("Python", "pending", 65), ("MongoDB", "verified", 79)],
        "s2": [("Python", "verified", 91), ("ML", "verified", 85), ("React", "pending", 60)],
        "s3": [("TypeScript", "verified", 94), ("React", "verified", 90), ("AWS", "verified", 72)],
        "s4": [("Java", "verified", 80), ("Spring Boot", "pending", 55), ("Docker", "failed", 40)],
        "s5": [("Flutter", "verified", 88), ("Firebase", "verified", 82), ("Dart", "pending", 70)],
        "s6": [("Python", "pending", 45), ("Git", "verified", 70)],
        "s7": [("Python", "verified", 76), ("ML", "pending", 61), ("Data Structures", "verified", 83)],
        "s8": [("System Design", "verified", 96), ("Go", "verified", 90), ("Kubernetes", "verified", 85), ("PostgreSQL", "verified", 88)],
        "s9": [("React", "pending", 58), ("JavaScript", "verified", 74)],
        "s10": [("Node.js", "verified", 81), ("MongoDB", "verified", 77), ("Express", "verified", 79)],
        "s11": [("Figma", "verified", 90), ("React", "verified", 86), ("CSS", "verified", 92)],
        "s12": [("AWS", "verified", 83), ("Docker", "verified", 79), ("Python", "verified", 75)],
    }
    for sid, slist in skills_map.items():
        for sname, sstatus, sscore in slist:
            sk = StudentSkill(
                student_id=sid,
                name=sname,
                status=sstatus,
                score=sscore,
                last_tested="2026-03-10"
            )
            session.add(sk)
    await session.flush()

    # 3. Seed Batches
    batches_data = [
        {"id": "b1", "name": "CSE Y1 A", "department": "CSE", "year": 1, "section": "Batch A", "coordinator": "Dr. Ravi Shankar", "academic_year": "2025-26", "total_students": 40, "skill_verified": 12, "active_projects": 4, "placement_ready": 0, "readiness_percent": 15, "status": "Active"},
        {"id": "b2", "name": "CSE Y1 B", "department": "CSE", "year": 1, "section": "Batch B", "coordinator": "Dr. Meena Iyer", "academic_year": "2025-26", "total_students": 38, "skill_verified": 9, "active_projects": 3, "placement_ready": 0, "readiness_percent": 12, "status": "Active"},
        {"id": "b3", "name": "CSE Y1 C", "department": "CSE", "year": 1, "section": "Batch C", "coordinator": "Prof. Suresh K", "academic_year": "2025-26", "total_students": 42, "skill_verified": 14, "active_projects": 5, "placement_ready": 0, "readiness_percent": 18, "status": "Active"},
        {"id": "b4", "name": "CSE Y2 A", "department": "CSE", "year": 2, "section": "Batch A", "coordinator": "Dr. Ravi Shankar", "academic_year": "2024-25", "total_students": 39, "skill_verified": 22, "active_projects": 8, "placement_ready": 0, "readiness_percent": 42, "status": "Active"},
        {"id": "b5", "name": "CSE Y2 B", "department": "CSE", "year": 2, "section": "Batch B", "coordinator": "Dr. Meena Iyer", "academic_year": "2024-25", "total_students": 40, "skill_verified": 18, "active_projects": 6, "placement_ready": 0, "readiness_percent": 35, "status": "Active"},
        {"id": "b6", "name": "CSE Y3 A", "department": "CSE", "year": 3, "section": "Batch A", "coordinator": "Prof. Sarah Jenkins", "academic_year": "2023-24", "total_students": 45, "skill_verified": 38, "active_projects": 12, "placement_ready": 18, "readiness_percent": 68, "status": "Active"},
        {"id": "b7", "name": "CSE Y4 A", "department": "CSE", "year": 4, "section": "Batch A", "coordinator": "Prof. Sarah Jenkins", "academic_year": "2022-23", "total_students": 40, "skill_verified": 36, "active_projects": 14, "placement_ready": 28, "readiness_percent": 89, "status": "Active"},
    ]
    for b in batches_data:
        session.add(Batch(**b))

    # 4. Seed Projects, Tasks, Milestones
    p1 = Project(
        id="p1",
        title="EduPortal",
        description="A comprehensive peer learning and collaborative management portal for students.",
        tech_stack_json=json.dumps(["React", "Node.js", "MongoDB", "TailwindCSS"]),
        team_size=4,
        timeline="3 months",
        status="Active",
        progress=65,
        start_date="2026-01-15",
        end_date="2026-04-15",
        created_by="s1"
    )
    session.add(p1)

    members_data = [
        {"project_id": "p1", "user_id": "s1", "name": "Aanya Sharma", "role": "Frontend Lead"},
        {"project_id": "p1", "user_id": "s2", "name": "Rohan Mehta", "role": "Backend Dev"},
        {"project_id": "p1", "user_id": "s3", "name": "Priya Nair", "role": "UI/UX Lead"},
        {"project_id": "p1", "user_id": "s10", "name": "Rahul Das", "role": "Database Engineer"},
    ]
    for m in members_data:
        session.add(ProjectMember(**m))

    tasks_data = [
        {"id": "t1", "project_id": "p1", "title": "Setup JWT Authentication", "description": "Implement token refresh and middleware guards", "status": "Done", "priority": "High", "assignee_name": "Aanya Sharma", "due_date": "2026-02-10", "labels_json": json.dumps(["Backend", "Auth"])},
        {"id": "t2", "project_id": "p1", "title": "Build Course List UI", "description": "Responsive grid display with filtering options", "status": "In Progress", "priority": "Medium", "assignee_name": "Priya Nair", "due_date": "2026-03-25", "labels_json": json.dumps(["Frontend", "UI"])},
        {"id": "t3", "project_id": "p1", "title": "MongoDB Index Optimization", "description": "Speed up search query execution across student rosters", "status": "In Review", "priority": "High", "assignee_name": "Rahul Das", "due_date": "2026-03-22", "labels_json": json.dumps(["Database"])},
        {"id": "t4", "project_id": "p1", "title": "Proctored MCQ Test Service", "description": "Integrate tab-switch telemetry and anti-cheat timer", "status": "Backlog", "priority": "High", "assignee_name": "Rohan Mehta", "due_date": "2026-04-01", "labels_json": json.dumps(["Feature"])}
    ]
    for t in tasks_data:
        session.add(Task(**t))

    milestones_data = [
        {"project_id": "p1", "title": "Architecture & Schema Approval", "description": "Database ERD and REST API documentation signed off", "due_date": "Feb 10, 2026", "status": "completed", "progress": 100},
        {"project_id": "p1", "title": "Core Modules & Auth Service", "description": "JWT authentication and RBAC coordinator portal complete", "due_date": "Mar 01, 2026", "status": "completed", "progress": 100},
        {"project_id": "p1", "title": "Kanban & Chat Workspace", "description": "Interactive board and real-time project messaging", "due_date": "Mar 28, 2026", "status": "active", "progress": 70},
        {"project_id": "p1", "title": "Final Proctored Evaluation", "description": "Department demo and performance test benchmark", "due_date": "Apr 15, 2026", "status": "upcoming", "progress": 0}
    ]
    for ml in milestones_data:
        session.add(Milestone(**ml))

    # 5. Seed Tests and Questions
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
        assigned_to="batch",
        target_batch="Batch A",
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

    q2 = Question(
        id="q2",
        test_id="test-react-adv",
        text="When should you use `useCallback` in a React functional component?",
        topic="Hooks & Performance",
        difficulty="Medium",
        explanation="useCallback memoizes callback instances across re-renders to prevent unnecessary child component re-evaluations when passed as props."
    )
    session.add(q2)
    options_q2 = [
        {"question_id": "q2", "text": "To memoize expensive calculation outputs", "is_correct": False},
        {"question_id": "q2", "text": "To cache function instances passed as props to memoized child components", "is_correct": True},
        {"question_id": "q2", "text": "To replace standard useEffect lifecycle calls", "is_correct": False},
        {"question_id": "q2", "text": "To manage global asynchronous Redux state", "is_correct": False},
    ]
    for opt in options_q2:
        session.add(QuestionOption(**opt))

    # 6. Seed Peer Reviews
    r1 = PeerReview(
        student_id="s1",
        reviewer_id="s2",
        reviewer_name="Rohan Mehta",
        reviewer_avatar="",
        project_name="EduPortal",
        rating=5,
        comment="Excellent collaborator, architected the frontend state beautifully and always on time!",
        date="2026-03-15"
    )
    session.add(r1)

    # 7. Seed Announcements
    ann1 = Announcement(
        id="ann1",
        title="Upcoming Amazon Proctored Coding Test",
        target_badge="Batch 2026 (Year 3)",
        message="All students are required to attempt the mandatory Amazon assessment skill test on Kollab before Friday 5 PM.",
        created_by="Prof. Sarah Jenkins",
        seen_count=184,
        read_count=162,
        timestamp="2 hours ago"
    )
    ann2 = Announcement(
        id="ann2",
        title="Kanban Peer Project Submissions Open",
        target_badge="All Students",
        message="Final year and third year project milestones have been updated on your dashboard. Please sync your Kanban tasks.",
        created_by="Prof. Sarah Jenkins",
        seen_count=220,
        read_count=198,
        timestamp="1 day ago"
    )
    session.add(ann1)
    session.add(ann2)

    # 8. Seed Notifications
    notifs_data = [
        {"user_id": "s1", "type": "test", "title": "New Test Assigned", "description": "React.js Advanced Proctored Test is due on Sep 30", "read": False, "timestamp": datetime.now(timezone.utc).isoformat(), "action": "Take Test"},
        {"user_id": "s1", "type": "project", "title": "Project Invitation", "description": "Priya invited you to collaborate on HealthTrack", "read": False, "timestamp": datetime.now(timezone.utc).isoformat(), "action": "View Invite"},
        {"user_id": "s1", "type": "team", "title": "New Team Message", "description": "Rohan sent a message in #general", "read": False, "timestamp": datetime.now(timezone.utc).isoformat()},
        {"user_id": "s1", "type": "system", "title": "Profile Verified", "description": "Your GitHub and Node.js skill badges have been verified.", "read": True, "timestamp": datetime.now(timezone.utc).isoformat()}
    ]
    for nd in notifs_data:
        session.add(Notification(**nd))

    # 9. Seed Timeline Events
    timeline_data = [
        {"student_id": "s1", "year": 1, "title": "Profile Created", "description": "Joined Kollab, completed basic profile setup.", "date": "2023-08-15", "status": "completed", "type": "profile"},
        {"student_id": "s1", "year": 1, "title": "Git Connected", "description": "Linked GitHub account, first 3 repositories synced.", "date": "2023-09-10", "status": "completed", "type": "github"},
        {"student_id": "s1", "year": 2, "title": "React Skill Test Verified", "description": "Scored 88% on proctored React assessment.", "date": "2024-05-18", "status": "completed", "type": "test"},
        {"student_id": "s1", "year": 3, "title": "EduPortal Project Lead", "description": "Formed team of 4, delivered 65% milestones.", "date": "2025-02-10", "status": "active", "type": "project"},
        {"student_id": "s1", "year": 4, "title": "Placement Drive", "description": "Final campus recruitment evaluation and interview.", "date": "2026-05-01", "status": "upcoming", "type": "placement"}
    ]
    for td in timeline_data:
        session.add(TimelineEvent(**td))

    await session.commit()
    logger.info("Database seeding successfully completed!")
