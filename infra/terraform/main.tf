terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# 1. AWS S3 Bucket for Student Resumes & Attachments
resource "aws_s3_bucket" "kollab_storage" {
  bucket        = "${var.project_name}-${var.environment}-storage"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "kollab_storage_policy" {
  bucket                  = aws_s3_bucket.kollab_storage.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 2. AWS RDS PostgreSQL Database Instance
resource "aws_db_instance" "kollab_db" {
  identifier             = "${var.project_name}-${var.environment}-postgres"
  allocated_storage      = 20
  max_allocated_storage  = 100
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = "db.t4g.micro"
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  skip_final_snapshot    = true
  publicly_accessible    = false
}

# 3. AWS App Runner Service for FastAPI Backend
resource "aws_apprunner_service" "kollab_backend" {
  service_name = "${var.project_name}-backend"

  source_configuration {
    auto_deployments_enabled = true
    image_repository {
      image_configuration {
        port = "5000"
        runtime_environment_variables = {
          "ENVIRONMENT"  = var.environment
          "DATABASE_URL" = "postgresql+asyncpg://${var.db_username}:${var.db_password}@${aws_db_instance.kollab_db.endpoint}/${var.db_name}"
          "S3_BUCKET"    = aws_s3_bucket.kollab_storage.bucket
        }
      }
      image_identifier      = "public.ecr.aws/kollab/backend:latest"
      image_repository_type = "ECR_PUBLIC"
    }
  }

  instance_configuration {
    cpu    = var.app_runner_cpu
    memory = var.app_runner_memory
  }
}
