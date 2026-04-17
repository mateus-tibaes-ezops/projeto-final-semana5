data "aws_route53_zone" "selected" {
  name         = var.route53_zone_name
  private_zone = false
}

locals {
  alb_hostname = kubernetes_ingress_v1.apps.status[0].load_balancer[0].ingress[0].hostname
  is_apex      = var.route53_subdomain == var.route53_zone_name
  alb_hosted_zone_ids = {
    "us-east-1"      = "Z35SXDOTRQ7X7K"
    "us-east-2"      = "Z2O1EMRO9K5GLX"
    "us-west-1"      = "Z368ELLRRE2KJ0"
    "us-west-2"      = "Z1H1FL5HABSF5"
    "ap-south-1"     = "ZP97RAFLXTNZK"
    "ap-northeast-1" = "Z2M4EHUR26P7ZW"
    "ap-northeast-2" = "Z3W03O7B5YMIYP"
    "ap-northeast-3" = "Z2YQB5RD63NC85"
    "ap-southeast-1" = "Z1LMS91P8CMLE5"
    "ap-southeast-2" = "Z1GM3OXH4ZPM65"
    "ca-central-1"   = "Z1QDHH18159H29"
    "eu-central-1"   = "Z215JYRZR1TBD5"
    "eu-west-1"      = "Z32O12XQLNTSW2"
    "eu-west-2"      = "Z3GKZC51ZF0DB4"
    "eu-west-3"      = "Z1GR9KJH5U9V2H"
    "eu-north-1"     = "Z23TAZ6LKFMNIO"
    "sa-east-1"      = "Z2ES9B8H0LK3R5"
  }
  alb_hosted_zone_id = lookup(local.alb_hosted_zone_ids, var.aws_region, null)
}

resource "aws_route53_record" "subdomain_cname" {
  count   = local.is_apex ? 0 : 1
  zone_id = data.aws_route53_zone.selected.zone_id
  name    = var.route53_subdomain
  type    = "CNAME"
  ttl     = 60
  records = [local.alb_hostname]

  depends_on = [kubernetes_ingress_v1.apps]
}

resource "aws_route53_record" "subdomain_alias" {
  count   = local.is_apex ? 1 : 0
  zone_id = data.aws_route53_zone.selected.zone_id
  name    = var.route53_subdomain
  type    = "A"

  alias {
    name                   = local.alb_hostname
    zone_id                = local.alb_hosted_zone_id
    evaluate_target_health = true
  }

  depends_on = [kubernetes_ingress_v1.apps]
}
