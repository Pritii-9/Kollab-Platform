"""
Kollab Platform — Security Utilities
Reusable security helpers for input validation, file upload checks,
and request sanitization.
"""

import re
import secrets
import logging
from typing import Optional, Set
from fastapi import UploadFile, HTTPException, Request, status

logger = logging.getLogger(__name__)

# ─── File Upload Security ─────────────────────────────────────────────────────

# Allowed file extensions for resume uploads
ALLOWED_RESUME_EXTENSIONS: Set[str] = {".pdf", ".doc", ".docx"}

# Allowed MIME types for resume uploads
ALLOWED_RESUME_MIMETYPES: Set[str] = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

# Maximum file size: 10 MB
MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024


def validate_file_extension(filename: str, allowed: Set[str] = ALLOWED_RESUME_EXTENSIONS) -> str:
    """
    Validate and return the file extension. Raises 400 if not in allowed set.
    """
    if not filename or "." not in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File must have an extension. Allowed: {', '.join(allowed)}"
        )
    ext = "." + filename.rsplit(".", 1)[-1].lower()
    if ext not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' not allowed. Allowed: {', '.join(allowed)}"
        )
    return ext


def validate_file_size(content: bytes, max_bytes: int = MAX_UPLOAD_SIZE_BYTES) -> None:
    """
    Validate file content size. Raises 413 if exceeds limit.
    """
    if len(content) > max_bytes:
        max_mb = max_bytes / (1024 * 1024)
        actual_mb = len(content) / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size ({actual_mb:.1f} MB) exceeds maximum allowed ({max_mb:.0f} MB)"
        )


def validate_content_type(
    content_type: Optional[str],
    allowed: Set[str] = ALLOWED_RESUME_MIMETYPES
) -> None:
    """
    Validate MIME content type. Raises 400 if not in allowed set.
    """
    if not content_type or content_type not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Content type '{content_type}' not allowed. Allowed: {', '.join(allowed)}"
        )


# ─── OTP Generation ──────────────────────────────────────────────────────────

def generate_secure_otp(digits: int = 6) -> str:
    """
    Generate a cryptographically secure OTP code.
    Uses secrets module instead of random for security.
    """
    max_val = 10 ** digits
    min_val = 10 ** (digits - 1)
    otp = secrets.randbelow(max_val - min_val) + min_val
    return str(otp)


# ─── IP Extraction ────────────────────────────────────────────────────────────

def get_client_ip(request: Request) -> str:
    """
    Extract the real client IP from the request, accounting for reverse proxies.
    Checks X-Forwarded-For and X-Real-IP headers before falling back to
    the direct connection IP.
    """
    # Check X-Forwarded-For (comma-separated list, first is original client)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Take the first (leftmost) IP — the original client
        client_ip = forwarded_for.split(",")[0].strip()
        if client_ip:
            return client_ip

    # Check X-Real-IP (set by Nginx or similar)
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()

    # Fallback to direct connection
    return request.client.host if request.client else "unknown"


# ─── Input Sanitization ──────────────────────────────────────────────────────

def sanitize_string(value: str, max_length: int = 500) -> str:
    """
    Basic string sanitization: strip whitespace, truncate to max length,
    and remove null bytes.
    """
    if not value:
        return value
    # Remove null bytes
    value = value.replace("\x00", "")
    # Strip and truncate
    return value.strip()[:max_length]
