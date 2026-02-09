# Journium Docs MCP - Deployment Guide

## Overview

This guide covers deploying the Journium Documentation MCP Server to AWS ECS as a containerized application.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    AWS ECS                          │
│  ┌───────────────────────────────────────────────┐ │
│  │  Fargate Task (journium-docs-mcp)             │ │
│  │  ┌─────────────────────────────────────────┐  │ │
│  │  │  Container (Node.js 20)                 │  │ │
│  │  │  - Express Server                       │  │ │
│  │  │  - MCP Protocol Handler                 │  │ │
│  │  │  - Documentation Index (51 MDX files)   │  │ │
│  │  │  - Port 3100                            │  │ │
│  │  └─────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Prerequisites

1. **AWS CLI** installed and configured
2. **Docker** installed locally
3. **pnpm** installed
4. AWS credentials with permissions for:
   - ECR (push images)
   - ECS (create/update services)
   - IAM (create roles if needed)

## Initial AWS Setup

### 1. Create ECR Repository

```bash
aws ecr create-repository \
  --repository-name journium-docs-mcp \
  --region us-east-1
```

### 2. Create ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name journium-cluster \
  --region us-east-1
```

### 3. Create Task Execution Role

Create a file `task-execution-role-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Create the role:

```bash
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://task-execution-role-policy.json

aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

### 4. Create CloudWatch Log Group

```bash
aws logs create-log-group \
  --log-group-name /ecs/journium-docs-mcp \
  --region us-east-1
```

### 5. Register Task Definition

Create `task-definition.json`:

```json
{
  "family": "journium-docs-mcp",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "docs-mcp",
      "image": "<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/journium-docs-mcp:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3100,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3100"
        }
      ],
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "node -e \"fetch('http://localhost:3100/health').then(r => r.ok ? process.exit(0) : process.exit(1))\""
        ],
        "interval": 30,
        "timeout": 10,
        "retries": 3,
        "startPeriod": 5
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/journium-docs-mcp",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register it:

```bash
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json
```

### 6. Create ECS Service

```bash
aws ecs create-service \
  --cluster journium-cluster \
  --service-name docs-mcp-service \
  --task-definition journium-docs-mcp \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --region us-east-1
```

> **Note**: Replace subnet and security group IDs with your VPC configuration.

## Deployment Methods

### Method 1: Automated Deployment (GitHub Actions)

The repository includes a GitHub Actions workflow that automatically deploys on push to main.

**Setup Required:**

1. Add AWS credentials to GitHub Secrets:
   - `AWS_ROLE_TO_ASSUME` - IAM role ARN for OIDC authentication

2. Push changes to main branch:

```bash
git add .
git commit -m "Update docs MCP server"
git push origin main
```

The workflow will:
- Build the Docker image
- Push to ECR
- Update ECS service
- Wait for deployment stability

### Method 2: Manual Deployment Script

Use the provided deployment script:

```bash
cd apps/docs-mcp
./scripts/deploy-ecs.sh
```

**Environment Variables:**

```bash
export AWS_REGION=us-east-1
export ECR_REPOSITORY=journium-docs-mcp
export ECS_CLUSTER=journium-cluster
export ECS_SERVICE=docs-mcp-service
export IMAGE_TAG=latest
```

### Method 3: Manual Docker Build & Deploy

```bash
cd apps/docs-mcp

# 1. Prepare content and build
pnpm build:docker

# 2. Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/journium-docs-mcp"

# 3. Build Docker image
docker build -t journium-docs-mcp:latest .

# 4. Tag for ECR
docker tag journium-docs-mcp:latest "$ECR_URI:latest"

# 5. Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin "$ECR_URI"

# 6. Push to ECR
docker push "$ECR_URI:latest"

# 7. Update ECS service
aws ecs update-service \
  --cluster journium-cluster \
  --service docs-mcp-service \
  --force-new-deployment \
  --region us-east-1
```

## Monitoring & Operations

### View Logs

```bash
# Stream logs
aws logs tail /ecs/journium-docs-mcp --follow

# Get recent logs
aws logs tail /ecs/journium-docs-mcp --since 1h
```

### Check Service Status

```bash
aws ecs describe-services \
  --cluster journium-cluster \
  --services docs-mcp-service \
  --region us-east-1
```

### View Tasks

```bash
aws ecs list-tasks \
  --cluster journium-cluster \
  --service-name docs-mcp-service \
  --region us-east-1
```

### Restart Service

```bash
aws ecs update-service \
  --cluster journium-cluster \
  --service docs-mcp-service \
  --force-new-deployment \
  --region us-east-1
```

### Scale Service

```bash
aws ecs update-service \
  --cluster journium-cluster \
  --service docs-mcp-service \
  --desired-count 2 \
  --region us-east-1
```

## Testing the Deployment

### Health Check

```bash
# If service has public IP
curl http://<TASK_PUBLIC_IP>:3100/health

# Expected response
{"ok":true}
```

### Test MCP Endpoint

```bash
curl -X POST http://<TASK_PUBLIC_IP>:3100/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

### Test Reindex

```bash
curl -X POST http://<TASK_PUBLIC_IP>:3100/reindex
```

## Troubleshooting

### Container Won't Start

1. Check CloudWatch logs:
```bash
aws logs tail /ecs/journium-docs-mcp --follow
```

2. Verify task definition:
```bash
aws ecs describe-task-definition --task-definition journium-docs-mcp
```

3. Check task events:
```bash
aws ecs describe-tasks \
  --cluster journium-cluster \
  --tasks <TASK_ARN>
```

### Health Check Failing

1. Verify port 3100 is accessible within container
2. Check if Node.js fetch API is available (Node 18+)
3. Review health check logs in CloudWatch

### Out of Memory

Increase task memory in task definition:
```json
"memory": "1024"
```

### Slow Performance

- Increase CPU: `"cpu": "512"`
- Add more tasks: `--desired-count 2`
- Enable auto-scaling based on CPU/memory

## Cost Estimation

**Fargate Pricing (us-east-1):**

- vCPU: $0.04048 per vCPU per hour
- Memory: $0.004445 per GB per hour

**Example Configuration (0.25 vCPU, 0.5 GB):**

- Hourly: $0.012 per task per hour
- Daily: $0.29 per task
- Monthly: ~$8.76 per task (730 hours)

**Additional Costs:**

- ECR Storage: $0.10 per GB per month
- Data Transfer: $0.09 per GB (after free tier)
- CloudWatch Logs: $0.50 per GB ingested

## Security Considerations

1. **Use IAM Roles**: Don't embed credentials in container
2. **Private Subnets**: Deploy tasks in private subnets with NAT gateway
3. **Security Groups**: Restrict inbound traffic to necessary ports only
4. **Secrets**: Use AWS Secrets Manager for sensitive config
5. **Network Isolation**: Use VPC endpoints for AWS services

## Rollback

If deployment fails:

```bash
# Get previous task definition revision
aws ecs describe-task-definition \
  --task-definition journium-docs-mcp:2

# Update service to use previous revision
aws ecs update-service \
  --cluster journium-cluster \
  --service docs-mcp-service \
  --task-definition journium-docs-mcp:2
```

## CI/CD Best Practices

1. **Tag Images**: Use Git SHA or version tags
2. **Blue/Green Deployment**: Use ECS deployment circuit breaker
3. **Automated Rollback**: Configure deployment failure detection
4. **Testing**: Add integration tests before deployment
5. **Notifications**: Set up SNS/Slack alerts for deployments

## Support

For issues or questions:
- Check CloudWatch logs first
- Review ECS service events
- Verify task definition configuration
- Test locally with `pnpm docker:build && pnpm docker:run`
