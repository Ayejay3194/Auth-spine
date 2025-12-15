# Terraform (skeleton)
This is a scaffold. Wire it to your cloud of choice.

Suggested modules:
- VPC/network
- Container runtime (ECS/K8s)
- Postgres (RDS)
- Redis (Elasticache)
- Secrets (Vault/Secrets Manager)
- Object storage (reports, exports)

This repo includes Helm for K8s. If you're using ECS, replace Helm with ECS service + ALB.
