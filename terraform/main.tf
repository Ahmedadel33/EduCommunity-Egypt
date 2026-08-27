# ============================================================
#  EduCommunity — AWS infrastructure (Terraform)
#  Backend on ECS Fargate behind an ALB, across 2+ AZs,
#  with auto-scaling. Redis + S3/CloudFront in storage.tf.
# ============================================================
terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  # Remote state (create the bucket + DynamoDB lock table first)
  backend "s3" {
    bucket         = "educommunity-tfstate"
    key            = "prod/terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "educommunity-tflock"
  }
}

provider "aws" {
  region = var.region
}

# ---------- Networking: VPC across multiple AZs ----------
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "educommunity-vpc"
  cidr = "10.0.0.0/16"
  azs             = ["${var.region}a", "${var.region}b"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.11.0/24", "10.0.12.0/24"]

  enable_nat_gateway = true      # private subnets reach the internet for pulls
  single_nat_gateway = true      # set false for full HA (one NAT per AZ)
}

# ---------- Container registry ----------
resource "aws_ecr_repository" "backend" {
  name                 = "educommunity-backend"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration { scan_on_push = true }
}

# ---------- Security groups ----------
resource "aws_security_group" "alb" {
  name   = "educommunity-alb"
  vpc_id = module.vpc.vpc_id
  ingress { from_port = 443, to_port = 443, protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 80,  to_port = 80,  protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] }
  egress  { from_port = 0, to_port = 0, protocol = "-1", cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_security_group" "app" {
  name   = "educommunity-app"
  vpc_id = module.vpc.vpc_id
  ingress { from_port = 5000, to_port = 5000, protocol = "tcp", security_groups = [aws_security_group.alb.id] }
  egress  { from_port = 0, to_port = 0, protocol = "-1", cidr_blocks = ["0.0.0.0/0"] }
}

# ---------- Application Load Balancer ----------
resource "aws_lb" "main" {
  name               = "educommunity-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnets
}

resource "aws_lb_target_group" "backend" {
  name        = "educommunity-backend"
  port        = 5000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"
  health_check {
    path                = "/api/v1/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    matcher             = "200"
  }
  # sticky sessions for long-lived Socket.IO connections
  stickiness { type = "lb_cookie", enabled = true, cookie_duration = 86400 }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.acm_certificate_arn   # from AWS Certificate Manager
  default_action { type = "forward", target_group_arn = aws_lb_target_group.backend.arn }
}

# ---------- ECS Fargate cluster + service ----------
resource "aws_ecs_cluster" "main" {
  name = "educommunity"
  setting { name = "containerInsights", value = "enabled" }
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/educommunity-backend"
  retention_in_days = 30
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "educommunity-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_exec.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name      = "backend"
    image     = "${aws_ecr_repository.backend.repository_url}:latest"
    essential = true
    portMappings = [{ containerPort = 5000 }]
    # pull secrets from AWS Secrets Manager (recommended)
    secrets = [
      { name = "MONGODB_URI",        valueFrom = var.secret_mongodb_uri },
      { name = "JWT_SECRET",         valueFrom = var.secret_jwt },
      { name = "JWT_REFRESH_SECRET", valueFrom = var.secret_jwt_refresh },
      { name = "REDIS_URL",          valueFrom = var.secret_redis_url }
    ]
    environment = [{ name = "NODE_ENV", value = "production" }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.backend.name
        "awslogs-region"        = var.region
        "awslogs-stream-prefix" = "backend"
      }
    }
  }])
}

resource "aws_ecs_service" "backend" {
  name            = "educommunity-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 2                      # start with 2 tasks across 2 AZs (HA)
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [aws_security_group.app.id]
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 5000
  }
  depends_on = [aws_lb_listener.https]
}

# ---------- Auto scaling (target tracking on CPU) ----------
resource "aws_appautoscaling_target" "backend" {
  max_capacity       = 40
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "cpu" {
  name               = "cpu-target-tracking"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification { predefined_metric_type = "ECSServiceAverageCPUUtilization" }
    target_value       = 60          # keep average CPU near 60%; scale out above, in below
    scale_in_cooldown  = 120
    scale_out_cooldown = 60
  }
}
