from routes.auth import router as auth_router
from routes.students import router as students_router
from routes.batches import router as batches_router
from routes.projects import router as projects_router
from routes.tests import router as tests_router
from routes.reports import router as reports_router
from routes.ai import router as ai_router
from routes.resume import router as resume_router
from routes.health import router as health_router

__all__ = [
    "auth_router",
    "students_router",
    "batches_router",
    "projects_router",
    "tests_router",
    "reports_router",
    "ai_router",
    "resume_router",
    "health_router",
]
