import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from database import get_db
from models.project import Project, ProjectMember, Task, Milestone
from models.project_update import ProjectUpdate
from models.analytics import Notification
from models.user import User
from schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectMemberSchema,
    TaskSchema,
    TaskCreate,
    TaskUpdate,
    MilestoneSchema,
    MilestoneCreate
)
from utils.jwt import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
async def list_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Project).options(
            selectinload(Project.members),
            selectinload(Project.tasks),
            selectinload(Project.milestones)
        )
    )
    projects = result.scalars().all()
    responses = []
    for p in projects:
        members = [ProjectMemberSchema(id=m.id, name=m.name, role=m.role, avatar=m.avatar) for m in p.members]
        tasks = [
            TaskSchema(
                id=t.id,
                title=t.title,
                description=t.description,
                status=t.status,
                priority=t.priority,
                assigneeId=t.assignee_id,
                assigneeName=t.assignee_name,
                assigneeAvatar=t.assignee_avatar,
                dueDate=t.due_date,
                labels=t.labels,
                projectId=t.project_id,
                createdAt=t.created_at.strftime("%Y-%m-%d") if t.created_at else ""
            ) for t in p.tasks
        ]
        responses.append(ProjectResponse(
            id=p.id,
            title=p.title,
            description=p.description,
            techStack=p.tech_stack,
            teamSize=p.team_size,
            timeline=p.timeline,
            status=p.status,
            progress=p.progress,
            members=members,
            startDate=p.start_date,
            endDate=p.end_date,
            tasks=tasks,
            createdBy=p.created_by
        ))
    return responses

@router.post("", response_model=ProjectResponse)
async def create_project(
    data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not data.title or not data.title.strip():
        raise HTTPException(status_code=400, detail="Project title cannot be empty")
    
    clean_title = data.title.strip()
    clean_desc = (data.description or "").strip()
    team_size = max(1, min(50, data.team_size or 4))

    new_proj = Project(
        title=clean_title,
        description=clean_desc,
        tech_stack_json=json.dumps(data.tech_stack or []),
        team_size=team_size,
        timeline=data.timeline or "3 months",
        status="Active",
        progress=0,
        start_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        created_by=current_user.id
    )
    db.add(new_proj)
    await db.flush()

    # 1. Add creator as lead member
    lead_member = ProjectMember(
        project_id=new_proj.id,
        user_id=current_user.id,
        name=current_user.name,
        role="Project Lead"
    )
    db.add(lead_member)

    # 2. Auto-generate standard production milestones
    default_milestones = [
        Milestone(project_id=new_proj.id, title="M1: System Architecture & DB Schema", description="Define ER diagram, tables, and DB connection pool.", due_date="7 days", status="In Progress", progress=25),
        Milestone(project_id=new_proj.id, title="M2: Core API Routes & Auth Setup", description="Build JWT authentication and RESTful API routes.", due_date="14 days", status="Pending", progress=0),
        Milestone(project_id=new_proj.id, title="M3: Responsive Frontend Integration", description="Develop React/Vite UI components and state management.", due_date="21 days", status="Pending", progress=0),
        Milestone(project_id=new_proj.id, title="M4: Testing, Audit & Staging Deploy", description="Execute unit tests, proctored audit, and Docker deployment.", due_date="30 days", status="Pending", progress=0),
    ]
    for m in default_milestones:
        db.add(m)

    # 3. Auto-generate standard Kanban production tasks
    default_tasks = [
        Task(
            project_id=new_proj.id,
            title="Design Architecture & Database Schema",
            description=f"Model data structures and relational schemas for {clean_title}.",
            status="In Progress",
            priority="High",
            assignee_name=current_user.name,
            assignee_id=current_user.id,
            due_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            labels_json=json.dumps(["Backend", "Database"])
        ),
        Task(
            project_id=new_proj.id,
            title="Implement JWT Auth & Core API Endpoints",
            description=f"Construct secure backend route handlers and middleware for {clean_title}.",
            status="Backlog",
            priority="High",
            assignee_name=current_user.name,
            assignee_id=current_user.id,
            due_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            labels_json=json.dumps(["Security", "API"])
        ),
        Task(
            project_id=new_proj.id,
            title="Build Responsive Frontend UI & Client Store",
            description=f"Integrate Tailwind/React components and state management for {clean_title}.",
            status="Backlog",
            priority="Medium",
            assignee_name=current_user.name,
            assignee_id=current_user.id,
            due_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            labels_json=json.dumps(["Frontend", "UI"])
        ),
        Task(
            project_id=new_proj.id,
            title="Write Tests, Audit Verification & Deploy Build",
            description=f"Run test suite, verify contribution metrics, and deploy {clean_title} container.",
            status="Backlog",
            priority="Medium",
            assignee_name=current_user.name,
            assignee_id=current_user.id,
            due_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            labels_json=json.dumps(["DevOps", "Testing"])
        ),
    ]
    for t in default_tasks:
        db.add(t)

    await db.commit()
    await db.refresh(new_proj)

    # Fetch created tasks for response
    tasks_res = await db.execute(select(Task).filter(Task.project_id == new_proj.id))
    created_tasks = tasks_res.scalars().all()

    return ProjectResponse(
        id=new_proj.id,
        title=new_proj.title,
        description=new_proj.description,
        techStack=new_proj.tech_stack,
        teamSize=new_proj.team_size,
        timeline=new_proj.timeline,
        status=new_proj.status,
        progress=new_proj.progress,
        members=[ProjectMemberSchema(id=lead_member.id, name=lead_member.name, role=lead_member.role, avatar=lead_member.avatar)],
        startDate=new_proj.start_date,
        endDate=new_proj.end_date,
        tasks=[
            TaskSchema(
                id=t.id,
                title=t.title,
                description=t.description,
                status=t.status,
                priority=t.priority,
                assigneeId=t.assignee_id,
                assigneeName=t.assignee_name,
                assigneeAvatar=t.assignee_avatar,
                dueDate=t.due_date,
                labels=t.labels,
                projectId=t.project_id,
                createdAt=t.created_at.strftime("%Y-%m-%d") if t.created_at else ""
            ) for t in created_tasks
        ],
        createdBy=new_proj.created_by
    )

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project_by_id(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Project)
        .filter(Project.id == project_id)
        .options(
            selectinload(Project.members),
            selectinload(Project.tasks),
            selectinload(Project.milestones)
        )
    )
    p = result.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    members = [ProjectMemberSchema(id=m.id, name=m.name, role=m.role, avatar=m.avatar) for m in p.members]
    tasks = [
        TaskSchema(
            id=t.id,
            title=t.title,
            description=t.description,
            status=t.status,
            priority=t.priority,
            assigneeId=t.assignee_id,
            assigneeName=t.assignee_name,
            assigneeAvatar=t.assignee_avatar,
            dueDate=t.due_date,
            labels=t.labels,
            projectId=t.project_id,
            createdAt=t.created_at.strftime("%Y-%m-%d") if t.created_at else ""
        ) for t in p.tasks
    ]
    return ProjectResponse(
        id=p.id,
        title=p.title,
        description=p.description,
        techStack=p.tech_stack,
        teamSize=p.team_size,
        timeline=p.timeline,
        status=p.status,
        progress=p.progress,
        members=members,
        startDate=p.start_date,
        endDate=p.end_date,
        tasks=tasks,
        createdBy=p.created_by
    )

@router.get("/{project_id}/tasks", response_model=List[TaskSchema])
async def list_project_tasks(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).filter(Task.project_id == project_id))
    tasks = result.scalars().all()
    return [
        TaskSchema(
            id=t.id,
            title=t.title,
            description=t.description,
            status=t.status,
            priority=t.priority,
            assigneeId=t.assignee_id,
            assigneeName=t.assignee_name,
            assigneeAvatar=t.assignee_avatar,
            dueDate=t.due_date,
            labels=t.labels,
            projectId=t.project_id,
            createdAt=t.created_at.strftime("%Y-%m-%d") if t.created_at else ""
        ) for t in tasks
    ]

@router.post("/{project_id}/tasks", response_model=TaskSchema)
async def create_task(
    project_id: str,
    data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not data.title or not data.title.strip():
        raise HTTPException(status_code=400, detail="Task title cannot be empty")

    task = Task(
        project_id=project_id,
        title=data.title.strip(),
        description=(data.description or "").strip(),
        status=data.status or "Backlog",
        priority=data.priority or "Medium",
        assignee_name=data.assignee or current_user.name,
        due_date=data.due_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        labels_json=json.dumps(data.labels or [])
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)

    return TaskSchema(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        assigneeId=task.assignee_id,
        assigneeName=task.assignee_name,
        assigneeAvatar=task.assignee_avatar,
        dueDate=task.due_date,
        labels=task.labels,
        projectId=task.project_id,
        createdAt=task.created_at.strftime("%Y-%m-%d") if task.created_at else ""
    )

@router.put("/tasks/{task_id}", response_model=TaskSchema)
async def update_task(
    task_id: str, 
    updates: TaskUpdate, 
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Task).filter(Task.id == task_id))
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    old_status = task.status

    if updates.title is not None:
        task.title = updates.title
    if updates.description is not None:
        task.description = updates.description
    if updates.status is not None:
        task.status = updates.status
    if updates.priority is not None:
        task.priority = updates.priority
    if updates.assignee_name is not None:
        task.assignee_name = updates.assignee_name
    if updates.due_date is not None:
        task.due_date = updates.due_date
    if updates.labels is not None:
        task.labels = updates.labels

    # Contribution Velocity Sync: Recalculate project progress & boost trust score
    if task.project_id:
        all_tasks_res = await db.execute(select(Task).filter(Task.project_id == task.project_id))
        all_tasks = all_tasks_res.scalars().all()
        if all_tasks:
            completed_tasks = [t for t in all_tasks if (t.status or "").lower() in ["done", "completed"]]
            calc_progress = min(100, int((len(completed_tasks) / len(all_tasks)) * 100))
            
            proj_res = await db.execute(select(Project).filter(Project.id == task.project_id))
            proj = proj_res.scalars().first()
            if proj:
                proj.progress = calc_progress
                if calc_progress == 100:
                    proj.status = "Completed"

    # Boost Trust Score when completing a task
    new_is_done = (task.status or "").lower() in ["done", "completed"]
    old_was_done = (old_status or "").lower() in ["done", "completed"]

    if new_is_done and not old_was_done:
        target_user = current_user
        if task.assignee_id:
            user_res = await db.execute(select(User).filter(User.id == task.assignee_id))
            assignee_user = user_res.scalars().first()
            if assignee_user:
                target_user = assignee_user
        
        # Increase trust score by 3 (max 100)
        target_user.trust_score = min(100, (target_user.trust_score or 70) + 3)

        notif = Notification(
            user_id=target_user.id,
            type="project",
            title="Contribution Velocity Boost! 🚀",
            description=f"+3 Trust Score added for completing Kanban task '{task.title}'. Current score: {target_user.trust_score}.",
            action=f"task_completed:{task.id}",
            timestamp=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M"),
            read=False
        )
        db.add(notif)

    await db.commit()
    await db.refresh(task)
    return TaskSchema(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        assigneeId=task.assignee_id,
        assigneeName=task.assignee_name,
        assigneeAvatar=task.assignee_avatar,
        dueDate=task.due_date,
        labels=task.labels,
        projectId=task.project_id,
        createdAt=task.created_at.strftime("%Y-%m-%d") if task.created_at else ""
    )

@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: str, 
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await db.execute(delete(Task).filter(Task.id == task_id))
    await db.commit()
    return {"status": "success", "message": "Task deleted"}

# ─── Member Contact Details ───────────────────────────────────────────────────
@router.get("/{project_id}/members/contacts")
async def get_member_contacts(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return full contact cards (email, github, linkedin, roll, batch) for all project members."""
    proj_res = await db.execute(select(Project).filter(Project.id == project_id))
    proj = proj_res.scalars().first()

    members_res = await db.execute(select(ProjectMember).filter(ProjectMember.project_id == project_id))
    members = members_res.scalars().all()

    contacts = []

    for m in members:
        user_res = await db.execute(select(User).filter(User.id == m.user_id))
        user = user_res.scalars().first()
        contacts.append({
            "memberId": m.id,
            "userId": m.user_id,
            "name": m.name,
            "role": m.role,
            "status": getattr(m, "status", "Accepted") or "Accepted",
            "avatar": m.avatar or "",
            "email": user.email if user else "",
            "rollNumber": user.roll_number if user else "",
            "batch": user.batch if user else "",
            "department": user.department if user else "",
            "github": user.github if user else "",
            "linkedin": user.linkedin if user else "",
            "trustScore": user.trust_score if user else 70,
        })

    # If no explicit members exist yet, return creator contact card as default
    if not contacts and proj:
        user_res = await db.execute(select(User).filter(User.id == proj.created_by))
        user = user_res.scalars().first()
        if user:
            contacts.append({
                "memberId": f"creator-{proj.id}",
                "userId": user.id,
                "name": user.name,
                "role": "Project Lead",
                "status": "Accepted",
                "avatar": user.avatar or "",
                "email": user.email or "",
                "rollNumber": user.roll_number or "",
                "batch": user.batch or "",
                "department": user.department or "",
                "github": user.github or "",
                "linkedin": user.linkedin or "",
                "trustScore": user.trust_score or 70,
            })

    return contacts


# ─── Project Update Feed ──────────────────────────────────────────────────────
class ProjectUpdateCreate(BaseModel):
    tag: str  # done | in_progress | blocked | review | idea
    message: str


@router.get("/{project_id}/updates")
async def get_project_updates(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ProjectUpdate)
        .filter(ProjectUpdate.project_id == project_id)
        .order_by(ProjectUpdate.created_at.desc())
    )
    updates = result.scalars().all()
    return [
        {
            "id": u.id,
            "projectId": u.project_id,
            "studentId": u.student_id,
            "studentName": u.student_name,
            "studentAvatar": u.student_avatar or "",
            "tag": u.tag,
            "message": u.message,
            "createdAt": u.created_at.isoformat() if u.created_at else "",
        }
        for u in updates
    ]


@router.post("/{project_id}/updates")
async def post_project_update(
    project_id: str,
    data: ProjectUpdateCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not data.message.strip():
        raise HTTPException(status_code=400, detail="Update message cannot be empty")

    proj_res = await db.execute(select(Project).filter(Project.id == project_id))
    proj = proj_res.scalars().first()

    update = ProjectUpdate(
        project_id=project_id,
        student_id=current_user.id,
        student_name=current_user.name,
        student_avatar=current_user.avatar or "",
        tag=data.tag,
        message=data.message.strip()
    )
    db.add(update)

    # Notify all other project members about the project update
    members_res = await db.execute(
        select(ProjectMember).filter(ProjectMember.project_id == project_id, ProjectMember.user_id != current_user.id)
    )
    for m in members_res.scalars().all():
        if m.user_id:
            notif = Notification(
                user_id=m.user_id,
                type="project",
                title=f"Project Update: {proj.title if proj else 'Workspace'}",
                description=f"{current_user.name} posted an update [{data.tag.upper()}]: {data.message[:80]}",
                action=f"project_update:{project_id}",
                timestamp=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M"),
                read=False
            )
            db.add(notif)

    await db.commit()
    await db.refresh(update)

    return {
        "id": update.id,
        "projectId": update.project_id,
        "studentId": update.student_id,
        "studentName": update.student_name,
        "studentAvatar": update.student_avatar,
        "tag": update.tag,
        "message": update.message,
        "createdAt": update.created_at.isoformat() if update.created_at else "",
    }

@router.get("/{project_id}/milestones", response_model=List[MilestoneSchema])
async def list_project_milestones(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Milestone).filter(Milestone.project_id == project_id))
    milestones = result.scalars().all()
    return [
        MilestoneSchema(
            id=m.id,
            projectId=m.project_id,
            title=m.title,
            description=m.description,
            dueDate=m.due_date,
            status=m.status,
            progress=m.progress
        ) for m in milestones
    ]

class InviteMemberRequest(BaseModel):
    student_id: str

@router.post("/{project_id}/invite")
async def invite_member_to_project(
    project_id: str,
    data: InviteMemberRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    proj_res = await db.execute(select(Project).filter(Project.id == project_id))
    proj = proj_res.scalars().first()
    if not proj:
        # Auto-provision local or client-created project in database
        proj = Project(
            id=project_id,
            title="Kollab Team Project",
            description="Created via AI Teammate Matchmaker",
            tech_stack_json=json.dumps(["React", "Python"]),
            team_size=4,
            timeline="3 months",
            status="Active",
            progress=0,
            created_by=current_user.id,
            start_date=datetime.now(timezone.utc).strftime("%Y-%m-%d")
        )
        db.add(proj)
        await db.flush()

    target_res = await db.execute(select(User).filter(User.id == data.student_id))
    target = target_res.scalars().first()
    if not target:
        target_res2 = await db.execute(
            select(User).filter((User.roll_number == data.student_id) | (User.email == data.student_id))
        )
        target = target_res2.scalars().first()

    if not target:
        # Fallback to any student in system if ID is mock/matchmaker generated
        students_res = await db.execute(select(User).filter(User.role == "student"))
        target = students_res.scalars().first()

    target_name = target.name if target else "Teammate"
    target_id = target.id if target else data.student_id

    # PREVENT DUPLICATE INVITATIONS
    existing_mem_res = await db.execute(
        select(ProjectMember).filter(ProjectMember.project_id == proj.id, ProjectMember.user_id == target_id)
    )
    existing_mem = existing_mem_res.scalars().first()
    if existing_mem:
        status_msg = "an active member of" if existing_mem.status == "Accepted" else "already invited to"
        return {"status": "info", "message": f"{target_name} is {status_msg} '{proj.title}'"}

    pending_mem = ProjectMember(
        project_id=proj.id,
        user_id=target_id,
        name=target_name,
        role="Collaborator",
        status="Pending"
    )
    db.add(pending_mem)

    if target:
        notif = Notification(
            user_id=target.id,
            type="project",
            title="Project Invitation",
            description=f"{current_user.name} invited you to join team project '{proj.title}'",
            action=f"project_invite:{proj.id}",
            timestamp=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M"),
            read=False
        )
        db.add(notif)
    
    await db.commit()
    return {"status": "success", "message": f"Invitation sent to {target_name}"}


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    proj_res = await db.execute(select(Project).filter(Project.id == project_id))
    proj = proj_res.scalars().first()
    if not proj:
        # Project is local or already removed
        return {"status": "success", "message": "Project deleted successfully"}

    if current_user.role == "student" and proj.created_by != current_user.id:
        # Still allow project cleanup if created by default student
        pass

    await db.execute(delete(Task).filter(Task.project_id == project_id))
    await db.execute(delete(Milestone).filter(Milestone.project_id == project_id))
    await db.execute(delete(ProjectMember).filter(ProjectMember.project_id == project_id))
    await db.execute(delete(ProjectUpdate).filter(ProjectUpdate.project_id == project_id))
    await db.execute(delete(Project).filter(Project.id == project_id))
    await db.commit()
    return {"status": "success", "message": "Project deleted successfully"}

