variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
  default     = "devcodehub"
}

variable "domain_name" {
  description = "Domain name for CloudFront (Optional)"
  type        = string
  default     = ""
}
