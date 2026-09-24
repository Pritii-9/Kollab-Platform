import logging
import uuid
import time
from collections import defaultdict
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from config import settings
from database import init_db
from routes import (
    auth_router,
    students_router,
    batches_router,
    projects_router,
    tests_router,
    reports_router,
    ai_router,
    resume_router,
    health_router,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s request_id=%(message)s"
)
logger = logging.getLogger("kollab")


# ─── In-Process Rate Limiter ──────────────────────────────────────────────────
# Sliding window: tracks request timestamps per IP per route prefix.
# No Redis required — resets on server restart (acceptable for MVP).
_rate_limit_store: dict = defaultdict(list)
_RATE_LIMIT_WINDOW = 60   # seconds
_AUTH_MAX_REQUESTS = 5    # per window per IP

def _is_rate_limited(ip: str, path: str) -> bool:
    if not any(path.startswith(p) for p in ["/api/auth/login", "/api/auth/register"]):
        return False
    key = f"{ip}:{path.split('?')[0]}"
    now = time.monotonic()
    timestamps = [t for t in _rate_limit_store[key] if now - t < _RATE_LIMIT_WINDOW]
    timestamps.append(now)
    _rate_limit_store[key] = timestamps
    return len(timestamps) > _AUTH_MAX_REQUESTS


# ─── Middleware: Request ID ───────────────────────────────────────────────────
class RequestIDMiddleware(BaseHTTPMiddleware):
    """Attaches a unique X-Request-ID to every request for log correlation."""
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


# ─── Middleware: Security Headers ─────────────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds OWASP-recommended security headers to every response."""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com"
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        return response


from utils.cache import CacheService

# ─── Middleware: Rate Limiter ─────────────────────────────────────────────────
class RateLimitMiddleware(BaseHTTPMiddleware):
    """5 requests/minute/IP on auth endpoints via Redis (or in-memory fallback)."""
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if any(path.startswith(p) for p in ["/api/auth/login", "/api/auth/register", "/api/auth/verify-otp", "/api/v1/auth"]):
            client_ip = request.client.host if request.client else "unknown"
            is_limited = await CacheService.is_rate_limited(client_ip, path, max_requests=5, window_seconds=60)
            if is_limited:
                logger.warning(f"Rate limit hit: ip={client_ip} path={path}")
                return Response(
                    content='{"detail":"Too many requests. Please wait before retrying."}',
                    status_code=429,
                    media_type="application/json",
                    headers={"Retry-After": "60"}
                )
        return await call_next(request)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Kollab database schema...")
    await init_db()
    logger.info("Kollab platform backend started successfully.")
    yield
    logger.info("Kollab platform backend stopping...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Security & Observability Middleware (order matters: outermost first)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(RateLimitMiddleware)

# CORS — explicit methods only
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)

# Register All API Routers under /api
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(students_router, prefix=settings.API_V1_STR)
app.include_router(batches_router, prefix=settings.API_V1_STR)
app.include_router(projects_router, prefix=settings.API_V1_STR)
app.include_router(tests_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(resume_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Kollab Platform API",
        "version": settings.VERSION,
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
