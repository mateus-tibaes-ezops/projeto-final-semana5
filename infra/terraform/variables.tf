variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used in resource tags and names"
  type        = string
  default     = "week5-ci-cd"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "backend_image" {
  description = "Container image for backend deployment"
  type        = string
}

variable "frontend_image" {
  description = "Container image for frontend deployment"
  type        = string
}

variable "desired_nodes" {
  description = "Desired number of EKS worker nodes"
  type        = number
  default     = 2
}

variable "min_nodes" {
  description = "Minimum number of EKS worker nodes"
  type        = number
  default     = 2
}

variable "max_nodes" {
  description = "Maximum number of EKS worker nodes"
  type        = number
  default     = 4
}

variable "route53_zone_name" {
  description = "Nome da zona Route53 existente para criar o registro do subdomínio"
  type        = string
}

variable "route53_subdomain" {
  description = "Subdomínio ou domínio raiz completo que será apontado para o ALB, por exemplo app.example.com ou example.com"
  type        = string
}
