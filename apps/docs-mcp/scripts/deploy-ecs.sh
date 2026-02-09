#!/bin/bash
# AWS ECS Deployment Script for Journium Docs MCP Server

set -e

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REPOSITORY="${ECR_REPOSITORY:-journium-docs-mcp}"
ECS_CLUSTER="${ECS_CLUSTER:-journium-cluster}"
ECS_SERVICE="${ECS_SERVICE:-docs-mcp-service}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

echo "🚀 Deploying Journium Docs MCP Server to AWS ECS"
echo "   Region: $AWS_REGION"
echo "   Repository: $ECR_REPOSITORY"
echo "   Cluster: $ECS_CLUSTER"
echo "   Service: $ECS_SERVICE"
echo ""

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY"

echo "📦 Step 1: Building Docker image..."
pnpm build:docker

echo ""
echo "🏷️  Step 2: Tagging image..."
docker tag journium-docs-mcp:latest "$ECR_URI:$IMAGE_TAG"
docker tag journium-docs-mcp:latest "$ECR_URI:$(date +%Y%m%d-%H%M%S)"

echo ""
echo "🔐 Step 3: Authenticating with ECR..."
aws ecr get-login-password --region "$AWS_REGION" | \
  docker login --username AWS --password-stdin "$ECR_URI"

echo ""
echo "⬆️  Step 4: Pushing to ECR..."
docker push "$ECR_URI:$IMAGE_TAG"
docker push "$ECR_URI:$(date +%Y%m%d-%H%M%S)"

echo ""
echo "🔄 Step 5: Updating ECS service..."
aws ecs update-service \
  --cluster "$ECS_CLUSTER" \
  --service "$ECS_SERVICE" \
  --force-new-deployment \
  --region "$AWS_REGION"

echo ""
echo "✅ Deployment initiated successfully!"
echo "   Image: $ECR_URI:$IMAGE_TAG"
echo ""
echo "📊 Monitor deployment status:"
echo "   aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION"
