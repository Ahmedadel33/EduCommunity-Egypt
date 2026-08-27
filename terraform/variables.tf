variable "region" {
  description = "AWS region (eu-central-1, me-south-1 Bahrain, me-central-1 UAE)"
  type        = string
  default     = "eu-central-1"
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for the api.* domain (HTTPS on the ALB)"
  type        = string
}

# ARNs of secrets stored in AWS Secrets Manager (never hard-code these values)
variable "secret_mongodb_uri" { type = string }
variable "secret_jwt"         { type = string }
variable "secret_jwt_refresh" { type = string }
variable "secret_redis_url"   { type = string }
