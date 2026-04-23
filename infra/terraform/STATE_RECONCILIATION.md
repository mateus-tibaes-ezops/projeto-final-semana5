## Terraform State Reconciliation

This project now has a dedicated remote Terraform backend:

- S3 bucket: `week5-ci-cd-tfstate-618889059366-us-east-1`
- State key: `prod/terraform.tfstate`
- DynamoDB lock table: `week5-ci-cd-tfstate-locks`

Important:

- The live AWS environment already exists.
- The local Terraform configuration was previously run without a remote backend.
- Because of that, the current remote state is still empty and does not yet represent
  the existing VPC, EKS, Route53, ACM, and Kubernetes resources.

What this means:

- Future `terraform init` can now use a persistent backend.
- A safe `terraform apply` still requires importing or migrating the existing live
  resources into this backend state first.

Current live networking adjustment already applied manually in AWS:

- private subnet `us-east-1c` now uses the private route table from `us-east-1b`
- private route table `us-east-1c` was removed
- NAT Gateway `us-east-1c` is being removed

Recommended next step:

- run `terraform init`
- import the existing resources into the remote state before any real apply
