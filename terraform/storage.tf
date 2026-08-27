# ============================================================
#  Redis (ElastiCache), static hosting (S3 + CloudFront), IAM
# ============================================================

# ---------- ElastiCache Redis (cache + Socket.IO adapter) ----------
resource "aws_security_group" "redis" {
  name   = "educommunity-redis"
  vpc_id = module.vpc.vpc_id
  ingress { from_port = 6379, to_port = 6379, protocol = "tcp", security_groups = [aws_security_group.app.id] }
  egress  { from_port = 0, to_port = 0, protocol = "-1", cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_elasticache_subnet_group" "redis" {
  name       = "educommunity-redis"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "educommunity-redis"
  description          = "EduCommunity cache + socket.io adapter"
  engine               = "redis"
  node_type            = "cache.t4g.small"      # scale up as traffic grows
  num_cache_clusters   = 2                        # 1 primary + 1 replica (HA)
  automatic_failover_enabled = true
  multi_az_enabled     = true
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis.id]
  port                 = 6379
}

# ---------- S3 buckets for the two static front ends ----------
resource "aws_s3_bucket" "frontend" { bucket = "educommunity-frontend" }
resource "aws_s3_bucket" "admin"    { bucket = "educommunity-admin" }

# ---------- CloudFront (CDN) in front of each bucket ----------
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "educommunity-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  default_root_object = "index.html"
  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "frontend-s3"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }
  default_cache_behavior {
    target_origin_id       = "frontend-s3"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"  # Managed-CachingOptimized
  }
  # SPA routing: return index.html for 403/404 so client routing works
  custom_error_response { error_code = 403, response_code = 200, response_page_path = "/index.html" }
  custom_error_response { error_code = 404, response_code = 200, response_page_path = "/index.html" }
  restrictions { geo_restriction { restriction_type = "none" } }
  viewer_certificate { cloudfront_default_certificate = true }
}

# ---------- IAM roles for ECS ----------
data "aws_iam_policy_document" "ecs_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals { type = "Service", identifiers = ["ecs-tasks.amazonaws.com"] }
  }
}
resource "aws_iam_role" "ecs_exec" {
  name               = "educommunity-ecs-exec"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}
resource "aws_iam_role_policy_attachment" "ecs_exec" {
  role       = aws_iam_role.ecs_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
resource "aws_iam_role" "ecs_task" {
  name               = "educommunity-ecs-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}
