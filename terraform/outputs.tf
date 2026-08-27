output "alb_dns_name" {
  description = "Point api.educommunity.eg (Route 53) at this ALB"
  value       = aws_lb.main.dns_name
}
output "ecr_repository_url" {
  description = "Push backend images here"
  value       = aws_ecr_repository.backend.repository_url
}
output "redis_primary_endpoint" {
  value = aws_elasticache_replication_group.redis.primary_endpoint_address
}
output "frontend_cdn_domain" {
  value = aws_cloudfront_distribution.frontend.domain_name
}
