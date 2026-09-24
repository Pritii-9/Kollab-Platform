from typing import List
from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.user import User
from schemas.report import (
    BatchReportResponse,
    PlacementStatResponse,
    AnnouncementResponse,
    AnnouncementCreate
)
from services.report_service import ReportService
from services.notification_service import NotificationService
from utils.jwt import get_current_user, require_coordinator

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

@router.get("/batches", response_model=List[BatchReportResponse])
async def get_batch_reports(db: AsyncSession = Depends(get_db)):
    return await ReportService.get_batch_reports(db)

@router.get("/placement", response_model=List[PlacementStatResponse])
async def get_placement_stats(db: AsyncSession = Depends(get_db)):
    return await ReportService.get_placement_stats(db)

@router.get("/export-csv")
async def export_students_csv(
    current_user: User = Depends(require_coordinator),
    db: AsyncSession = Depends(get_db)
):
    csv_data = await ReportService.export_students_csv(db)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=kollab_students_export.csv"}
    )

@router.get("/announcements", response_model=List[AnnouncementResponse])
async def list_announcements(db: AsyncSession = Depends(get_db)):
    return await NotificationService.list_announcements(db)

@router.post("/announcements", response_model=AnnouncementResponse)
async def create_announcement(
    data: AnnouncementCreate,
    current_user: User = Depends(require_coordinator),
    db: AsyncSession = Depends(get_db)
):
    return await NotificationService.create_announcement(data, current_user.name, db)
