resource "kubernetes_namespace" "apps" {
  metadata {
    name = "apps"
  }
}

locals {
  apps_namespace = kubernetes_namespace.apps.metadata[0].name

  backend = {
    name         = "backend"
    service_name = "backend-service"
    image        = var.backend_image
    port         = 5001
    replicas     = 1
    resources = {
      requests = {
        cpu    = "100m"
        memory = "128Mi"
      }
      limits = {
        cpu    = "500m"
        memory = "256Mi"
      }
    }
    health_path = "/health"
    liveness = {
      initial_delay_seconds = 10
      period_seconds        = 10
    }
    readiness = {
      initial_delay_seconds = 5
      period_seconds        = 5
    }
  }

  frontend = {
    name         = "frontend"
    service_name = "frontend-service"
    image        = var.frontend_image
    port         = 3000
    service_port = 80
    replicas     = 2
    resources = {
      requests = {
        cpu    = "200m"
        memory = "256Mi"
      }
      limits = {
        cpu    = "700m"
        memory = "512Mi"
      }
    }
    health_path = "/"
    liveness = {
      initial_delay_seconds = 15
      period_seconds        = 10
    }
    readiness = {
      initial_delay_seconds = 10
      period_seconds        = 5
    }
    rolling_update = {
      max_surge       = "1"
      max_unavailable = "0"
    }
  }
}

resource "kubernetes_deployment" "backend" {
  metadata {
    name      = local.backend.name
    namespace = local.apps_namespace
    labels = {
      app = local.backend.name
    }
  }

  spec {
    # This API stores data in process memory, so multiple replicas would
    # produce inconsistent CRUD results behind the Service/Ingress.
    replicas = local.backend.replicas

    selector {
      match_labels = {
        app = local.backend.name
      }
    }

    template {
      metadata {
        labels = {
          app = local.backend.name
        }
      }

      spec {
        container {
          name  = local.backend.name
          image = local.backend.image

          port {
            container_port = local.backend.port
          }

          resources {
            requests = local.backend.resources.requests
            limits   = local.backend.resources.limits
          }

          liveness_probe {
            http_get {
              path = local.backend.health_path
              port = local.backend.port
            }
            initial_delay_seconds = local.backend.liveness.initial_delay_seconds
            period_seconds        = local.backend.liveness.period_seconds
          }

          readiness_probe {
            http_get {
              path = local.backend.health_path
              port = local.backend.port
            }
            initial_delay_seconds = local.backend.readiness.initial_delay_seconds
            period_seconds        = local.backend.readiness.period_seconds
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "backend" {
  metadata {
    name      = local.backend.service_name
    namespace = local.apps_namespace
  }

  spec {
    selector = {
      app = local.backend.name
    }

    port {
      port        = local.backend.port
      target_port = local.backend.port
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = local.frontend.name
    namespace = local.apps_namespace
    labels = {
      app = local.frontend.name
    }
  }

  spec {
    replicas = local.frontend.replicas

    strategy {
      type = "RollingUpdate"

      rolling_update {
        max_surge       = local.frontend.rolling_update.max_surge
        max_unavailable = local.frontend.rolling_update.max_unavailable
      }
    }

    selector {
      match_labels = {
        app = local.frontend.name
      }
    }

    template {
      metadata {
        labels = {
          app = local.frontend.name
        }
      }

      spec {
        container {
          name  = local.frontend.name
          image = local.frontend.image

          port {
            container_port = local.frontend.port
          }

          resources {
            requests = local.frontend.resources.requests
            limits   = local.frontend.resources.limits
          }

          liveness_probe {
            http_get {
              path = local.frontend.health_path
              port = local.frontend.port
            }
            initial_delay_seconds = local.frontend.liveness.initial_delay_seconds
            period_seconds        = local.frontend.liveness.period_seconds
          }

          readiness_probe {
            http_get {
              path = local.frontend.health_path
              port = local.frontend.port
            }
            initial_delay_seconds = local.frontend.readiness.initial_delay_seconds
            period_seconds        = local.frontend.readiness.period_seconds
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "frontend" {
  metadata {
    name      = local.frontend.service_name
    namespace = local.apps_namespace
  }

  spec {
    selector = {
      app = local.frontend.name
    }

    port {
      port        = local.frontend.service_port
      target_port = local.frontend.port
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_ingress_v1" "apps" {
  metadata {
    name      = "apps-ingress"
    namespace = local.apps_namespace
    annotations = {
      "kubernetes.io/ingress.class"               = "alb"
      "alb.ingress.kubernetes.io/scheme"          = "internet-facing"
      "alb.ingress.kubernetes.io/target-type"     = "ip"
      "alb.ingress.kubernetes.io/tags"            = "Project=${var.project_name},Environment=${var.environment},ManagedBy=terraform"
      "alb.ingress.kubernetes.io/certificate-arn" = aws_acm_certificate.ezopscloud.arn
      "alb.ingress.kubernetes.io/listen-ports"    = "[{\"HTTP\": 80}, {\"HTTPS\": 443}]"
      "alb.ingress.kubernetes.io/ssl-redirect"    = "443"
    }
  }

  spec {
    ingress_class_name = "alb"

    rule {
      host = var.route53_subdomain

      http {
        path {
          path      = "/api"
          path_type = "Prefix"

          backend {
            service {
              name = kubernetes_service.backend.metadata[0].name
              port {
                number = local.backend.port
              }
            }
          }
        }

        path {
          path      = "/"
          path_type = "Prefix"

          backend {
            service {
              name = kubernetes_service.frontend.metadata[0].name
              port {
                number = local.frontend.service_port
              }
            }
          }
        }
      }
    }
  }

  depends_on = [
    helm_release.aws_load_balancer_controller,
    aws_acm_certificate_validation.ezopscloud
  ]
}
