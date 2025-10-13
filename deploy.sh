#!/bin/bash

# Google Cloud Run Deployment Script for LUD-SaaS
# This script builds and deploys the application to Google Cloud Run

set -e

# Configuration
PROJECT_ID=${PROJECT_ID:-"your-project-id"}
REGION=${REGION:-"us-central1"}
SERVICE_NAME=${SERVICE_NAME:-"lud-saas"}
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment to Google Cloud Run${NC}"

# Check if PROJECT_ID is set
if [ "$PROJECT_ID" = "your-project-id" ]; then
    echo -e "${RED}❌ Please set PROJECT_ID environment variable${NC}"
    echo "Example: export PROJECT_ID=your-actual-project-id"
    exit 1
fi

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set the project
echo -e "${YELLOW}📋 Setting project to $PROJECT_ID${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${YELLOW}🔧 Enabling required APIs${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and push the image
echo -e "${YELLOW}🏗️  Building and pushing Docker image${NC}"
docker build --platform linux/amd64 -t $IMAGE_NAME .
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo -e "${YELLOW}🚀 Deploying to Cloud Run${NC}"
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --concurrency 80 \
    --timeout 300 \
    --set-env-vars NODE_ENV=production

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Service URL: $SERVICE_URL${NC}"
echo -e "${YELLOW}💡 To set environment variables, use:${NC}"
echo "gcloud run services update $SERVICE_NAME --region=$REGION --set-env-vars KEY=VALUE"
