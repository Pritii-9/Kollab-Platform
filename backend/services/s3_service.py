import io
import logging
from typing import Optional
from config import settings

logger = logging.getLogger(__name__)

class S3Service:
    @staticmethod
    def _get_client():
        if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_SECRET_ACCESS_KEY:
            return None
        try:
            import boto3
            return boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )
        except Exception as e:
            logger.warning(f"Failed to initialize S3 client: {e}")
            return None

    @classmethod
    async def upload_file(
        cls,
        file_bytes: bytes,
        key: str,
        content_type: str = "application/pdf"
    ) -> str:
        s3 = cls._get_client()
        if s3:
            try:
                s3.put_object(
                    Bucket=settings.S3_BUCKET_NAME,
                    Key=key,
                    Body=file_bytes,
                    ContentType=content_type
                )
                logger.info(f"File uploaded to S3: s3://{settings.S3_BUCKET_NAME}/{key}")
                return f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
            except Exception as e:
                logger.error(f"S3 upload error: {e}")
                return f"local://storage/{key}"
        return f"local://storage/{key}"

    @classmethod
    def generate_presigned_url(cls, key: str, expiration_seconds: int = 3600) -> Optional[str]:
        s3 = cls._get_client()
        if s3:
            try:
                return s3.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": settings.S3_BUCKET_NAME, "Key": key},
                    ExpiresIn=expiration_seconds
                )
            except Exception as e:
                logger.error(f"Presigned URL generation error: {e}")
                return None
        return None
