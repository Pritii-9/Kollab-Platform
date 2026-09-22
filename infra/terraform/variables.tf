variable "aws_region" {
  description = "AWS Region to deploy Kollab infrastructure"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (production, staging, dev)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name tag"
  type        = string
  default     = "kollab-platform"
}

variable "db_name" {
  description = "Database name for PostgreSQL"
  type        = string
  default     = "kollab_db"
}

variable "db_username" {
  description = "Database admin username"
  type        = string
  default     = "kollab_admin"
}

variable "db_password" {
  description = "Database admin password"
  type        = string
  sensitive   = true
}

variable "app_runner_cpu" {
  description = "App Runner CPU allocation"
  type        = string
  default     = "1024"
}

variable "app_runner_memory" {
  description = "App Runner memory allocation in MB"
  type        = string
  default     = "2048"
}
