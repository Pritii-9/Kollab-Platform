import math
import logging
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User
from models.skill import StudentSkill

logger = logging.getLogger(__name__)

class MatchmakerService:
    @staticmethod
    def _cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = math.sqrt(sum(a * a for a in vec1))
        magnitude2 = math.sqrt(sum(b * b for b in vec2))
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        return dot_product / (magnitude1 * magnitude2)

    @classmethod
    async def find_teammate_matches(
        cls,
        session: AsyncSession,
        required_skills: List[str],
        owner_id: str = "",
        min_cgpa: float = 0.0,
        preferred_role: str = ""
    ) -> List[Dict[str, Any]]:
        # Fetch all active student profiles with their skills
        query = select(User).filter(User.role == "student", User.is_active == True)
        if owner_id:
          query = query.filter(User.id != owner_id)
          
        query = query.options(selectinload(User.skills))
        result = await session.execute(query)
        students = result.scalars().all()

        if not required_skills:
            required_skills = ["React", "Node.js", "Python", "FastAPI", "MongoDB"]

        # Build vocabulary vector space
        vocab = list(set([s.lower() for s in required_skills]))
        target_vector = [1.0] * len(vocab)

        matches = []
        for s in students:
            # Extract student skills
            student_skill_names = [sk.name.lower() for sk in s.skills]
            student_skill_scores = {sk.name.lower(): (sk.score / 100.0) for sk in s.skills}

            # Build student vector in vocab space
            student_vector = []
            for skill_name in vocab:
                if skill_name in student_skill_scores:
                    student_vector.append(student_skill_scores[skill_name])
                elif skill_name in student_skill_names:
                    student_vector.append(0.8)
                else:
                    student_vector.append(0.0)

            # Cosine similarity calculation
            raw_sim = cls._cosine_similarity(target_vector, student_vector)
            
            # CGPA & Trust Score normalization factor
            cgpa_factor = min(s.cgpa / 10.0, 1.0) if s.cgpa else 0.75
            trust_factor = (s.trust_score / 100.0) if s.trust_score else 0.70

            # Hybrid ML score weighting: 60% Skill Similarity, 20% Trust Score, 20% CGPA
            weighted_score = (raw_sim * 0.60) + (trust_factor * 0.20) + (cgpa_factor * 0.20)
            match_percentage = min(max(int(weighted_score * 100), 45), 98)

            # Identify matched & complementary skills
            matched_skills = [
                sk.name for sk in s.skills if sk.name.lower() in vocab
            ]
            other_skills = [
                sk.name for sk in s.skills if sk.name.lower() not in vocab
            ]

            matches.append({
                "id": s.id,
                "name": s.name,
                "email": s.email,
                "rollNumber": s.roll_number,
                "department": s.department,
                "year": s.year,
                "cgpa": s.cgpa,
                "trustScore": s.trust_score,
                "placementStatus": s.placement_status,
                "avatar": s.avatar or "",
                "matchPercentage": match_percentage,
                "matchedSkills": matched_skills,
                "otherSkills": other_skills[:3],
                "bio": s.bio or "",
                "github": s.github or "",
                "linkedin": s.linkedin or "",
                "reason": f"High {match_percentage}% compatibility based on {len(matched_skills)} target skill matches and {s.trust_score} trust score."
            })

        # Sort descending by match percentage
        matches.sort(key=lambda x: x["matchPercentage"], reverse=True)
        return matches
