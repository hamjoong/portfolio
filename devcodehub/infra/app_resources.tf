# ECR Repository
resource "aws_ecr_repository" "backend" {
  name                 = "${var.project_name}-backend"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration { scan_on_push = true }
}

# S3 for Frontend & Uploads
resource "aws_s3_bucket" "assets" {
  bucket = "${var.project_name}-assets-${data.aws_caller_identity.current.account_id}"
}

data "aws_caller_identity" "current" {}

# CloudFront OAC
resource "aws_cloudfront_origin_access_control" "main" {
  name                              = "${var.project_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution (Advanced: Single Domain Strategy)
resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  default_root_object = "index.html"

  # Origin 1: S3 (Frontend)
  origin {
    domain_name              = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id                = "S3Origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.main.id
  }

  # Origin 2: ALB (Backend)
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "ALBOrigin"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only" # ALB가 퍼블릭 서브넷에 있더라도 내부 통신은 HTTP
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # 1. API 라우팅 (ALB로 전달)
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    target_origin_id = "ALBOrigin"
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Origin", "Access-Control-Request-Headers", "Access-Control-Request-Method"]
      cookies { forward = "all" }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  # 2. WebSocket 라우팅 (ALB로 전달)
  ordered_cache_behavior {
    path_pattern     = "/ws-stomp/*"
    target_origin_id = "ALBOrigin"
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]

    forwarded_values {
      query_string = true
      headers      = ["*"] # WebSocket 핸드셰이크를 위해 모든 헤더 전달
      cookies { forward = "all" }
    }

    viewer_protocol_policy = "https-only"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  # 3. 기본 동작 (S3 Frontend)
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Origin"

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  # React Router 새로고침 문제 해결 (SPA 지원)
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

