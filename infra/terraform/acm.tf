# AWS Certificate Manager for HTTPS
resource "aws_acm_certificate" "ezopscloud" {
  domain_name       = var.route53_subdomain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(
    local.tags,
    {
      Name = "ezopscloud-cert"
    }
  )
}

# Validate certificate with Route53 DNS
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.ezopscloud.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = data.aws_route53_zone.selected.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "ezopscloud" {
  certificate_arn           = aws_acm_certificate.ezopscloud.arn
  timeouts {
    create = "5m"
  }

  depends_on = [aws_route53_record.cert_validation]
}

output "acm_certificate_arn" {
  value       = aws_acm_certificate.ezopscloud.arn
  description = "ARN of the ACM certificate for HTTPS"
}
