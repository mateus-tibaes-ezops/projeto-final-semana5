terraform {
  backend "s3" {
    bucket         = "week5-ci-cd-tfstate-618889059366-us-east-1"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "week5-ci-cd-tfstate-locks"
    encrypt        = true
  }
}
