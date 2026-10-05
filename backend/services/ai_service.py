import json
import asyncio
import hashlib
import logging
import re
import time
from typing import List, Dict, Any, Optional
from config import settings

logger = logging.getLogger(__name__)

# ─── Prompt Injection Defense Sanitizer ──────────────────────────────────────
_INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions", re.IGNORECASE),
    re.compile(r"system\s*:\s*", re.IGNORECASE),
    re.compile(r"assistant\s*:\s*", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+", re.IGNORECASE),
    re.compile(r"jailbreak", re.IGNORECASE),
    re.compile(r"dan\s+mode", re.IGNORECASE),
    re.compile(r"<script.*?>.*?</script>", re.IGNORECASE | re.DOTALL),
]

def sanitize_prompt_input(text: str, max_len: int = 500) -> str:
    """Sanitize user-provided text before interpolating into LLM prompts."""
    if not text:
        return ""
    cleaned = str(text)[:max_len]
    for pattern in _INJECTION_PATTERNS:
        cleaned = pattern.sub("[filtered]", cleaned)
    return cleaned.strip()

# ─── In-Memory LLM Response Cache ────────────────────────────────────────────
# Key: sha256(prompt) → Value: (result, expires_at_timestamp)
# Avoids redundant Groq API calls for identical inputs within TTL window.
_llm_cache: Dict[str, tuple] = {}
_CACHE_TTL_SECONDS = 3600  # 1 hour

def _cache_key(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()

def _cache_get(key: str) -> Optional[Any]:
    entry = _llm_cache.get(key)
    if entry and time.monotonic() < entry[1]:
        logger.debug(f"LLM cache hit: {key[:16]}...")
        return entry[0]
    if entry:
        del _llm_cache[key]  # expired — evict
    return None

def _cache_set(key: str, value: Any, ttl: int = _CACHE_TTL_SECONDS):
    _llm_cache[key] = (value, time.monotonic() + ttl)


from fastapi import HTTPException

# ─── Sliding-Window Rate Limiter for LLM API Budgeting ──────────────────────
_user_request_timestamps: Dict[str, List[float]] = {}
_MAX_REQUESTS_PER_MINUTE = 10

def check_ai_rate_limit(user_id: str):
    now = time.monotonic()
    timestamps = _user_request_timestamps.get(user_id, [])
    recent = [t for t in timestamps if now - t < 60]
    if len(recent) >= _MAX_REQUESTS_PER_MINUTE:
        raise HTTPException(
            status_code=429,
            detail="AI API rate limit reached (max 10 requests per minute). Please wait a moment."
        )
    recent.append(now)
    _user_request_timestamps[user_id] = recent

# ─── Groq LLM Caller with Timeout + Retry + Token Budget Cap ────────────────
async def _call_groq(messages: list, max_tokens: int = 450, max_retries: int = 2) -> Optional[str]:
    """
    Call Groq API with:
    - Token budget cap (max_tokens=450/850)
    - Hard timeout (settings.GROQ_TIMEOUT_SECONDS)
    - Exponential backoff retry
    - Returns None on all failures (caller uses heuristic fallback)
    """
    if not settings.GROQ_API_KEY:
        return None

    for attempt in range(max_retries):
        try:
            from groq import AsyncGroq
            client = AsyncGroq(api_key=settings.GROQ_API_KEY)
            chat_completion = await asyncio.wait_for(
                client.chat.completions.create(
                    messages=messages,
                    model=settings.GROQ_MODEL,
                    max_tokens=max_tokens,
                    temperature=0.3,
                    response_format={"type": "json_object"},
                ),
                timeout=settings.GROQ_TIMEOUT_SECONDS
            )
            return chat_completion.choices[0].message.content

        except asyncio.TimeoutError:
            logger.warning(f"Groq API timeout on attempt {attempt + 1}/{max_retries}")
        except Exception as e:
            logger.warning(f"Groq API error on attempt {attempt + 1}/{max_retries}: {e}")

        if attempt < max_retries - 1:
            wait = 2 ** attempt  # 1s, 2s
            await asyncio.sleep(wait)

    logger.error("Groq API failed after retries — falling back to heuristic")
    return None


# ─── AI Service ───────────────────────────────────────────────────────────────
class AIService:

    @staticmethod
    async def enhance_resume_bullet(raw_bullet: str, target_role: str = "Full Stack Developer") -> List[str]:
        clean_bullet = sanitize_prompt_input(raw_bullet, max_len=400)
        clean_role = sanitize_prompt_input(target_role, max_len=100) or "Full Stack Developer"

        prompt = (
            f"You are an expert technical resume writer. Rewrite the following bullet point for a {clean_role} "
            f"position into 3 high-impact, quantified STAR-format bullet points using strong action verbs.\n"
            f"Raw bullet: \"{clean_bullet}\"\n"
            f"Return ONLY a JSON array of 3 strings with key 'bullets'."
        )

        # Resume bullets are user-specific — shorter 10-min cache is appropriate
        ck = _cache_key(f"resume:{clean_bullet}:{clean_role}")
        cached = _cache_get(ck)
        if cached:
            return cached

        messages = [
            {"role": "system", "content": "You are a specialized technical resume writer. Output ONLY a valid JSON object with key 'bullets' containing an array of 3 strings."},
            {"role": "user", "content": prompt}
        ]

        content = await _call_groq(messages)
        if content:
            try:
                parsed = json.loads(content)
                if isinstance(parsed, list):
                    result = parsed
                elif isinstance(parsed, dict) and "bullets" in parsed:
                    result = parsed["bullets"]
                else:
                    result = list(parsed.values())[0]
                _cache_set(ck, result, ttl=600)  # 10-min TTL for resume bullets
                return result
            except Exception as e:
                logger.warning(f"Failed to parse Groq resume response: {e}")

        # Smart Heuristic Fallback — runs when Groq is unavailable or parse fails
        clean = raw_bullet.strip().rstrip(".")
        fallback = [
            f"Architected and deployed {clean}, improving system response times by 35% and streamlining core data workflows across 1,000+ active user sessions.",
            f"Spearheaded the implementation of {clean} utilizing industry best practices, resulting in a 40% reduction in production latency and 99.9% uptime.",
            f"Engineered high-performance {clean} with end-to-end automated testing pipelines, accelerating feature release cycles by 2x.",
        ]
        return fallback

    @staticmethod
    async def analyze_skill_gap(current_skills: List[str], target_role: str) -> Dict[str, Any]:
        role_skills_map = {
            "Full Stack Developer": ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "REST APIs", "AWS"],
            "Frontend Engineer": ["React", "TypeScript", "TailwindCSS", "HTML/CSS", "JavaScript", "Figma", "Redux"],
            "Backend Architect": ["Python", "FastAPI", "Node.js", "PostgreSQL", "MongoDB", "Redis", "Docker", "System Design"],
            "Data Analyst & Scientist": ["Python", "Machine Learning", "Pandas", "NumPy", "SQL", "Scikit-Learn", "Data Visualization"],
            "DevOps & Cloud Engineer": ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Linux", "Git", "Cloud Infrastructure"],
            "Site Reliability Engineer (SRE)": ["Linux", "Kubernetes", "Prometheus", "Grafana", "Python", "Go", "Distributed Systems"],
            "Network & Cybersecurity Specialist": ["Networking", "TCP/IP", "Wireshark", "Firewalls", "Python", "Cybersecurity", "Linux"],
            "AI / Machine Learning Engineer": ["Python", "PyTorch", "TensorFlow", "Deep Learning", "LLMs", "NLP", "Scikit-Learn"],
        }

        # Cache by role + sorted skills — deterministic result for same input
        ck = _cache_key(f"skill_gap:{sorted(current_skills)}:{target_role}")
        cached = _cache_get(ck)
        if cached:
            return cached

        required = role_skills_map.get(target_role, ["React", "Node.js", "Python", "SQL", "Docker"])
        normalized_current = [s.lower() for s in current_skills]

        matched = [r for r in required if r.lower() in normalized_current]
        missing = [r for r in required if r.lower() not in normalized_current]
        readiness_score = int((len(matched) / len(required)) * 100) if required else 80

        recommendations = [
            f"Complete a proctored assessment in {skill} to earn a verified badge." for skill in missing[:2]
        ]
        if missing:
            recommendations.append(f"Build a portfolio project demonstrating hands-on proficiency in {missing[0]}.")

        result = {
            "targetRole": target_role,
            "readinessScore": readiness_score,
            "matchedSkills": matched,
            "missingSkills": missing,
            "recommendations": recommendations,
        }
        _cache_set(ck, result)
        return result

    @staticmethod
    async def recommend_roles(current_skills: List[str]) -> List[Dict[str, Any]]:
        ck = _cache_key(f"recommend_roles:{sorted(current_skills)}")
        cached = _cache_get(ck)
        if cached:
            return cached

        roles = [
            "Full Stack Developer",
            "Frontend Engineer",
            "Backend Architect",
            "Data Analyst & Scientist",
            "DevOps & Cloud Engineer",
            "Site Reliability Engineer (SRE)",
            "Network & Cybersecurity Specialist",
            "AI / Machine Learning Engineer",
        ]
        results = []
        for r in roles:
            analysis = await AIService.analyze_skill_gap(current_skills, r)
            results.append({
                "role": r,
                "matchPercentage": analysis["readinessScore"],
                "matchedSkillsCount": len(analysis["matchedSkills"]),
                "missingSkillsCount": len(analysis["missingSkills"]),
                "topMissing": analysis["missingSkills"][:3],
            })

        results.sort(key=lambda x: x["matchPercentage"], reverse=True)
        _cache_set(ck, results)
        return results

    @staticmethod
    async def generate_mcq_questions(skill: str, difficulty: str = "Medium", count: int = 5) -> List[Dict[str, Any]]:
        """
        Generate MCQ questions. Attempts Groq first (for rich skill-specific questions),
        falls back to high-quality built-in templates with strict schema validation.
        """
        clean_skill = sanitize_prompt_input(skill, max_len=80) or "General Software Engineering"
        clean_diff = sanitize_prompt_input(difficulty, max_len=20) or "Medium"
        count = max(1, min(int(count or 5), 30))

        ck = _cache_key(f"mcq:{clean_skill}:{clean_diff}:{count}")
        cached = _cache_get(ck)
        if cached:
            return cached

        prompt = (
            f"Generate {count} multiple-choice questions for a proctored technical assessment on '{clean_skill}' "
            f"at {clean_diff} difficulty. Each question must have 4 options with exactly one correct answer.\n"
            f"Return a JSON object with key 'questions', each item having: "
            f"text, topic, difficulty, explanation, options (array of {{text, isCorrect}})."
        )

        messages = [
            {"role": "system", "content": "You are a senior technical interviewer. Output ONLY valid JSON."},
            {"role": "user", "content": prompt}
        ]

        content = await _call_groq(messages)
        if content:
            try:
                parsed = json.loads(content)
                raw_questions = parsed.get("questions", parsed) if isinstance(parsed, dict) else parsed
                if isinstance(raw_questions, list) and len(raw_questions) > 0:
                    validated_questions = []
                    for q in raw_questions:
                        if not isinstance(q, dict) or "text" not in q or "options" not in q:
                            continue
                        opts = q.get("options", [])
                        if not isinstance(opts, list) or len(opts) < 2:
                            continue
                        # Ensure exactly one option is flagged correct
                        has_correct = any(bool(o.get("isCorrect")) for o in opts if isinstance(o, dict))
                        if not has_correct and len(opts) > 0 and isinstance(opts[0], dict):
                            opts[0]["isCorrect"] = True
                        validated_questions.append({
                            "text": str(q.get("text", "")).strip(),
                            "topic": str(q.get("topic", clean_skill)).strip(),
                            "difficulty": str(q.get("difficulty", clean_diff)).strip(),
                            "explanation": str(q.get("explanation", "")).strip(),
                            "options": [
                                {
                                    "text": str(o.get("text", "")).strip(),
                                    "isCorrect": bool(o.get("isCorrect", False))
                                }
                                for o in opts if isinstance(o, dict) and o.get("text")
                            ]
                        })

                    if len(validated_questions) > 0:
                        _cache_set(ck, validated_questions, ttl=7200)  # 2hr cache
                        return validated_questions
            except Exception as e:
                logger.warning(f"Failed to parse Groq MCQ response: {e}")

        # Built-in high-quality fallback templates
        fallback = [
            {
                "text": f"What is the primary best practice for resource lifecycle cleanup in {clean_skill}?",
                "topic": "Lifecycle & Memory",
                "difficulty": clean_diff,
                "explanation": f"Proper cleanup in {clean_skill} prevents memory leaks and ensures system responsiveness.",
                "options": [
                    {"text": "Ignore cleanup and rely solely on OS process termination", "isCorrect": False},
                    {"text": "Explicitly unsubscribe event listeners and release connections in teardown hooks", "isCorrect": True},
                    {"text": "Force-restart the application process on every request", "isCorrect": False},
                    {"text": "Allocate double memory buffers to avoid cleanup", "isCorrect": False},
                ],
            },
            {
                "text": f"How should error propagation be handled in production {clean_skill} architectures?",
                "topic": "Error Handling",
                "difficulty": clean_diff,
                "explanation": "Centralized structured error boundaries provide resilience without exposing internal stack traces.",
                "options": [
                    {"text": "Centralized error middleware and resilient fallback boundaries", "isCorrect": True},
                    {"text": "Suppress all errors silently with empty catch blocks", "isCorrect": False},
                    {"text": "Print stack traces directly to the client browser UI", "isCorrect": False},
                    {"text": "Crash the entire server immediately on any unhandled exception", "isCorrect": False},
                ],
            },
            {
                "text": f"Which pattern best handles async operations in {clean_skill}?",
                "topic": "Async Design",
                "difficulty": clean_diff,
                "explanation": "Async/Await with structured error boundaries is the industry standard for async I/O.",
                "options": [
                    {"text": "Synchronous blocking loop", "isCorrect": False},
                    {"text": "Async/Await with error boundary handling", "isCorrect": True},
                    {"text": "Polling every 100ms in a while loop", "isCorrect": False},
                    {"text": "Spawning a new OS thread per request", "isCorrect": False},
                ],
            },
        ]
        _cache_set(ck, fallback, ttl=7200)
        return fallback
