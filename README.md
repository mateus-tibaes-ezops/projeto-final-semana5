# Week5 CI/CD - Frontend + Backend + EKS

Projeto em monorepo com:

- `backend/`: API Flask
- `frontend/`: app Next.js
- `infra/terraform/`: infraestrutura AWS + EKS + workloads Kubernetes

## Arquitetura

- VPC em multiplas AZs
- EKS com node group gerenciado e escalavel
- Deployments de frontend e backend com `replicas = 2`
- Services internos e Ingress externo para roteamento
- CD da aplicacao via Terraform (sem deploy por GitHub Actions)

## CI/CD

Workflows separados por contexto:

- `.github/workflows/backend-ci.yml`
- `.github/workflows/frontend-ci.yml`
- `.github/workflows/infra-ci.yml`

Cada workflow roda apenas quando os paths correspondentes sao alterados.

## Rodando localmente

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker Compose (frontend + backend)

```bash
docker compose up --build
```

## Provisionamento com Terraform

1. Configure credenciais AWS no ambiente.
2. Copie o exemplo de variaveis:

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
```

3. Ajuste as imagens de `backend_image` e `frontend_image`.
4. Informe `route53_zone_name` e `route53_subdomain` para criar o registro DNS do subdomínio.
5. Execute:

```bash
terraform init
terraform plan
terraform apply
```

## Observacoes

- O AWS Load Balancer Controller ja e instalado pelo Terraform com IRSA via Helm.
- O Ingress usa `ingress_class_name = "alb"` e depende da instalacao do controller.
- O `terraform plan` no CI usa imagens de exemplo apenas para validar o fluxo.
