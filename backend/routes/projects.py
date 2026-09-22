import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.project import Project, ProjectMember, Task, Milestone
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
    new_proj = Project(
        title=data.title,
        description=data.description,
        tech_stack_json=json.dumps(data.tech_stack),
        team_size=data.team_size,
        timeline=data.timeline,
        status="Active",
        progress=0,
        start_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        created_by=current_user.id
    )
    db.add(new_proj)
    await db.flush()

    # Add creator as lead member
    lead_member = ProjectMember(
        project_id=new_proj.id,
        user_id=current_user.id,
        name=current_user.name,
        role="Project Lead"
    )
    db.add(lead_member)
    await db.commit()
    await db.refresh(new_proj)

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
        tasks=[],
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
    task = Task(
        project_id=project_id,
        title=data.title,
        description=data.description or "",
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
async def update_task(task_id: str, updates: TaskUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).filter(Task.id == task_id))
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

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
async def delete_task(task_id: str, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Task).filter(Task.id == task_id))
    await db.commit()
    return {"status": "success", "message": "Task deleted"}

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
