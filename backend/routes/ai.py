from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from services.ai_service import AIService
from models.user import User
from utils.jwt import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Tools"])

class BulletEnhanceRequest(BaseModel):
    rawBullet: str
    targetRole: Optional[str] = "Full Stack Developer"

class SkillGapRequest(BaseModel):
    skills: List[str]
    targetRole: str

class RoleRecommendRequest(BaseModel):
    skills: List[str]

class QuestionGenerateRequest(BaseModel):
    skill: str
    difficulty: Optional[str] = "Medium"
    count: Optional[int] = 5

@router.post("/enhance-bullet")
async def enhance_bullet(data: BulletEnhanceRequest, current_user: User = Depends(get_current_user)):
    bullets = await AIService.enhance_resume_bullet(data.rawBullet, data.targetRole or "Full Stack Developer")
    return {"bullets": bullets}

@router.post("/skill-gap")
async def analyze_skill_gap(data: SkillGapRequest, current_user: User = Depends(get_current_user)):
    return await AIService.analyze_skill_gap(data.skills, data.targetRole)

@router.post("/recommend-roles")
async def recommend_roles(data: RoleRecommendRequest, current_user: User = Depends(get_current_user)):
    roles = await AIService.recommend_roles(data.skills)
    return {"roles": roles}

@router.post("/generate-questions")
async def generate_questions(data: QuestionGenerateRequest, current_user: User = Depends(get_current_user)):
    questions = await AIService.generate_mcq_questions(data.skill, data.difficulty or "Medium", data.count or 5)
    return {"questions": questions}
