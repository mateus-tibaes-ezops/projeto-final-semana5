data "aws_route53_zone" "selected" {
  name         = var.route53_zone_name
  private_zone = false
}

resource "aws_route53_record" "subdomain" {
  zone_id = data.aws_route53_zone.selected.zone_id
  name    = var.route53_subdomain
  type    = "CNAME"
  ttl     = 60
  records = [kubernetes_ingress_v1.apps.status[0].load_balancer[0].ingress[0].hostname]

  depends_on = [kubernetes_ingress_v1.apps]
}
