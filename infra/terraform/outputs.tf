output "app_runner_url" {
  description = "Public URL of the deployed Kollab FastAPI backend"
  value       = aws_apprunner_service.kollab_backend.service_url
}

output "s3_bucket_name" {
  description = "Name of the AWS S3 storage bucket"
  value       = aws_s3_bucket.kollab_storage.bucket
}

output "rds_endpoint" {
  description = "PostgreSQL RDS database endpoint"
  value       = aws_db_instance.kollab_db.endpoint
  sensitive   = true
}
