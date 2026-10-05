import logging
from typing import Dict, Any, List
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User
from models.skill import StudentSkill
from models.test import TestAttempt
from models.project import ProjectMember, Task

from services.ml_service import ml_predictor

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
                "riskLevel": "High Risk",
                "radarData": [],
                "recommendations": ["Complete your profile registration."],
                "modelType": "RandomForestClassifier-v1"
            }

        # 1. Skill Mastery Component
        verified_skills = [s for s in student.skills if s.status == "verified"]
        avg_skill_score = (
            sum(s.score for s in verified_skills) / len(verified_skills)
            if verified_skills else 50.0
        )

        # 2. Proctored Test Score Component
        test_attempts_query = select(TestAttempt).filter(TestAttempt.student_id == student_id)
        test_res = await session.execute(test_attempts_query)
        attempts = test_res.scalars().all()

        if attempts:
            avg_test_percent = sum(a.percentage for a in attempts) / len(attempts)
        else:
            avg_test_percent = 65.0  # Baseline metric if no tests taken yet

        # 3. Kanban Velocity & Contribution Component
        tasks_query = select(Task).filter(Task.assignee_id == student_id)
        tasks_res = await session.execute(tasks_query)
        completed_tasks = [t for t in tasks_res.scalars().all() if t.status == "Done"]
        kanban_velocity = min(len(completed_tasks) * 20.0, 100.0)

        # 4. Academic CGPA & Trust Score
        cgpa_val = float(student.cgpa or 7.0)
        cgpa_score = (cgpa_val / 10.0) * 100.0
        trust_val = float(student.trust_score or 75.0)

        # 5. Execute Scikit-Learn Random Forest Classifier Inference
        ml_prediction = ml_predictor.predict(
            cgpa=cgpa_val,
            trust_score=trust_val,
            verified_skills_count=len(verified_skills),
            assessment_avg=avg_test_percent,
            sprint_velocity=kanban_velocity
        )

        total_readiness = ml_prediction["readinessScore"]
        status = ml_prediction["status"]
        risk_level = ml_prediction["riskLevel"]
        recommendations = ml_prediction["recommendations"]

        # Radar Breakdown Chart Data
        radar_data = [
            {"subject": "Core Skills", "current": int(avg_skill_score), "target": 90},
            {"subject": "Proctored Tests", "current": int(avg_test_percent), "target": 85},
            {"subject": "Kanban Velocity", "current": int(kanban_velocity), "target": 80},
            {"subject": "Academia CGPA", "current": int(cgpa_score), "target": 85},
            {"subject": "Trust Score", "current": int(trust_val), "target": 90}
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
            "recommendations": recommendations,
            "probabilities": ml_prediction.get("probabilities", {}),
            "featureWeights": ml_prediction.get("featureWeights", {}),
            "modelType": ml_prediction.get("modelType", "RandomForestClassifier-v1")
        }
