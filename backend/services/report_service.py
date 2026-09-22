import io
import csv
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.batch import Batch
from models.user import User
from schemas.report import BatchReportResponse, PlacementStatResponse

class ReportService:
    @staticmethod
    async def get_batch_reports(db: AsyncSession) -> List[BatchReportResponse]:
        result = await db.execute(select(Batch))
        batches = result.scalars().all()

        reports = []
        for b in batches:
            status_text = "On Track"
            if b.readiness_percent < 40:
                status_text = "Critical"
            elif b.readiness_percent < 60:
                status_text = "Needs Attention"

            reports.append(BatchReportResponse(
                id=f"br-{b.id}",
                batchName=b.name,
                department=b.department,
                year=b.year,
                totalStudents=b.total_students,
                skillVerified=b.skill_verified,
                avgCGPA=8.1,
                readinessPercent=b.readiness_percent,
                placedCount=b.placement_ready,
                topSkills=["React", "Python", "Node.js"],
                status=status_text
            ))
        return reports

    @staticmethod
    async def get_placement_stats(db: AsyncSession) -> List[PlacementStatResponse]:
        return [
            PlacementStatResponse(company="Google", hired=3, role="SWE", batch="CSE Year 4"),
            PlacementStatResponse(company="Amazon", hired=7, role="SDE-1", batch="CSE Year 4"),
            PlacementStatResponse(company="Microsoft", hired=5, role="Software Engineer", batch="CSE Year 4"),
            PlacementStatResponse(company="Infosys", hired=22, role="Systems Engineer", batch="Multiple"),
            PlacementStatResponse(company="Wipro", hired=18, role="Project Engineer", batch="Multiple"),
            PlacementStatResponse(company="TCS", hired=34, role="Systems Engineer", batch="Multiple"),
        ]

    @staticmethod
    async def export_students_csv(db: AsyncSession) -> str:
        result = await db.execute(select(User).filter(User.role == "student"))
        students = result.scalars().all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Roll Number", "Name", "Department", "Year", "Batch", "CGPA", "Trust Score", "Placement Status", "Email"])

        for s in students:
            writer.writerow([
                s.roll_number or "N/A",
                s.name,
                s.department or "CSE",
                s.year or 1,
                s.batch or "Batch A",
                s.cgpa or 0.0,
                s.trust_score,
                s.placement_status,
                s.email
            ])

        return output.getvalue()
