terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = ">= 5.0" }
  }
}

provider "aws" {
  region = var.aws_region
}

# Skeleton: S3 bucket for exports
resource "aws_s3_bucket" "exports" {
  bucket = var.exports_bucket_name
}

output "exports_bucket" {
  value = aws_s3_bucket.exports.bucket
}
