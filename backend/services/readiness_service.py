import logging
from typing import Dict, Any, List
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User
from models.skill import StudentSkill
from models.test import TestAttempt
from models.project import ProjectMember, Task

logger = logging.getLogger(__name__)

class ReadinessService:
    @classmethod
    async def calculate_student_readiness(
        cls,
        session: AsyncSession,
        student_id: str
    ) -> Dict[str, Any]:
        # Fetch student details with skills
        query = select(User).filter(User.id == student_id).options(selectinload(User.skills))
        result = await session.execute(query)
        student = result.scalars().first()

        if not student:
            return {
                "studentId": student_id,
                "readinessScore": 0,
                "status": "Ineligible",
                "riskLevel": "High",
                "radarData": [],
                "recommendations": ["Complete your profile registration."]
            }

        # 1. Skill Mastery Component (Weight: 30%)
        verified_skills = [s for s in student.skills if s.status == "verified"]
        avg_skill_score = (
            sum(s.score for s in verified_skills) / len(verified_skills)
            if verified_skills else 50.0
        )
        skill_component = (avg_skill_score / 100.0) * 30.0

        # 2. Proctored Test Score Component (Weight: 30%)
        test_attempts_query = select(TestAttempt).filter(TestAttempt.user_id == student_id)
        test_res = await session.execute(test_attempts_query)
        attempts = test_res.scalars().all()

        if attempts:
            avg_test_percent = sum(a.percentage for a in attempts) / len(attempts)
        else:
            avg_test_percent = 65.0  # Baseline metric if no tests taken yet
        test_component = (avg_test_percent / 100.0) * 30.0

        # 3. Kanban Velocity & Contribution Component (Weight: 25%)
        tasks_query = select(Task).filter(Task.assignee_id == student_id)
        tasks_res = await session.execute(tasks_query)
        completed_tasks = [t for t in tasks_res.scalars().all() if t.status == "Done"]
        kanban_velocity = min(len(completed_tasks) * 20.0, 100.0)
        velocity_component = (kanban_velocity / 100.0) * 25.0

        # 4. Academic CGPA & Trust Score Component (Weight: 15%)
        cgpa_score = ((student.cgpa or 7.0) / 10.0) * 100.0
        academic_component = (cgpa_score / 100.0) * 15.0

        # Total Placement Readiness Percentage
        total_readiness = int(round(skill_component + test_component + velocity_component + academic_component))
        total_readiness = min(max(total_readiness, 15), 99)

        # Classification Logic
        if total_readiness >= 80:
            status = "Placement Ready"
            risk_level = "Low Risk"
        elif total_readiness >= 60:
            status = "On Track"
            risk_level = "Moderate"
        else:
            status = "At Risk"
            risk_level = "High Risk"

        # Generate ML Actionable Recommendations
        recommendations: List[str] = []
        if len(verified_skills) < 3:
            recommendations.append("Attempt proctored assessments in Python or React to verify 2 more skill badges.")
        if len(attempts) == 0:
            recommendations.append("Take the recommended React.js Advanced Proctored Test to benchmark score.")
        if len(completed_tasks) < 2:
            recommendations.append("Complete pending Kanban tasks on your active collaborative project to boost contribution velocity.")
        if student.cgpa and student.cgpa >= 8.0:
            recommendations.append("High CGPA unlocked eligibility for Tier-1 Amazon & Google campus placement drives.")

        if not recommendations:
            recommendations.append("Maintain current project velocity and complete upcoming milestone evaluations.")

        # Radar Breakdown Chart Data
        radar_data = [
            {"subject": "Core Skills", "current": int(avg_skill_score), "target": 90},
            {"subject": "Proctored Tests", "current": int(avg_test_percent), "target": 85},
            {"subject": "Kanban Velocity", "current": int(kanban_velocity), "target": 80},
            {"subject": "Academia CGPA", "current": int(cgpa_score), "target": 85},
            {"subject": "Trust Score", "current": student.trust_score or 75, "target": 90}
        ]

        return {
            "studentId": student_id,
            "studentName": student.name,
            "readinessScore": total_readiness,
            "status": status,
            "riskLevel": risk_level,
            "verifiedSkillsCount": len(verified_skills),
            "testsCompletedCount": len(attempts),
            "tasksCompletedCount": len(completed_tasks),
            "radarData": radar_data,
            "recommendations": recommendations
        }
