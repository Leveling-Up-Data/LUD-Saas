# Google Cloud Run Deployment Guide

This guide will help you deploy the LUD-SaaS application to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account**: You need a Google Cloud account with billing enabled
2. **Google Cloud CLI**: Install the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)
3. **Docker**: Install [Docker](https://docs.docker.com/get-docker/) for building container images
4. **Node.js**: Install Node.js 18+ for local development

## Quick Start

### 1. Set up Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create your-project-id --name="LUD SaaS"

# Set the project
export PROJECT_ID=your-project-id
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Configure Environment Variables

Copy the example environment file and configure your variables:

```bash
cp cloud-run.env.example .env
```

Edit `.env` with your actual values:

```bash
# Required for Stripe payments
STRIPE_SECRET_KEY=sk_live_your_actual_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_live_your_actual_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret

# Optional: Custom Stripe price IDs
STRIPE_STARTER_PRICE_ID=price_1234567890
STRIPE_PROFESSIONAL_PRICE_ID=price_0987654321
STRIPE_ENTERPRISE_PRICE_ID=price_1122334455
```

### 3. Deploy to Cloud Run

#### Option A: Using the deployment script (Recommended)

```bash
# Make sure you're in the project root
cd /path/to/LUD-Saas

# Set your project ID
export PROJECT_ID=your-project-id

# Run the deployment script
./deploy.sh
```

#### Option B: Manual deployment

```bash
# Build the Docker image
docker build -t gcr.io/$PROJECT_ID/lud-saas .

# Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/lud-saas

# Deploy to Cloud Run
gcloud run deploy lud-saas \
    --image gcr.io/$PROJECT_ID/lud-saas \
    --region us-central1 \
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
```

### 4. Set Environment Variables

After deployment, set your environment variables:

```bash
gcloud run services update lud-saas \
    --region us-central1 \
    --set-env-vars STRIPE_SECRET_KEY=sk_live_your_key \
    --set-env-vars VITE_STRIPE_PUBLIC_KEY=pk_live_your_key \
    --set-env-vars STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

## Configuration

### Service Configuration

The application is configured with the following Cloud Run settings:

- **Memory**: 1GB
- **CPU**: 1 vCPU
- **Port**: 8080
- **Min Instances**: 0 (scales to zero)
- **Max Instances**: 10
- **Concurrency**: 80 requests per instance
- **Timeout**: 300 seconds

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Application environment | Yes | `production` |
| `PORT` | Port to listen on | Yes | `8080` |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes* | - |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe public key | Yes* | - |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes* | - |
| `STRIPE_STARTER_PRICE_ID` | Stripe price ID for starter plan | No | `price_starter` |
| `STRIPE_PROFESSIONAL_PRICE_ID` | Stripe price ID for professional plan | No | `price_professional` |
| `STRIPE_ENTERPRISE_PRICE_ID` | Stripe price ID for enterprise plan | No | `price_enterprise` |

*Required for payment features to work

## Monitoring and Logs

### View Logs

```bash
# View recent logs
gcloud logs read --service=lud-saas --limit=50

# Follow logs in real-time
gcloud logs tail --service=lud-saas
```

### Monitor Performance

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to Cloud Run
3. Select your service
4. View metrics, logs, and performance data

## Updating the Application

### Automatic Updates (CI/CD)

To set up automatic deployments when you push to your repository:

1. Connect your repository to Google Cloud Build
2. The `cloudbuild.yaml` file will automatically build and deploy on push

### Manual Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and redeploy
./deploy.sh
```

## Troubleshooting

### Common Issues

1. **Build fails**: Check that all dependencies are in `package.json`
2. **Service won't start**: Check logs for environment variable issues
3. **Memory errors**: Increase memory allocation in Cloud Run settings
4. **Timeout errors**: Increase timeout or optimize application performance

### Debug Commands

```bash
# Check service status
gcloud run services describe lud-saas --region=us-central1

# View detailed logs
gcloud logs read --service=lud-saas --severity=ERROR

# Test locally with Docker
docker run -p 8080:8080 -e NODE_ENV=production gcr.io/$PROJECT_ID/lud-saas
```

### Health Check

The application includes a health check endpoint at `/api/products`. Cloud Run will use this to determine if the service is healthy.

## Security Considerations

1. **Environment Variables**: Never commit sensitive keys to version control
2. **HTTPS**: Cloud Run automatically provides HTTPS
3. **Authentication**: Consider implementing authentication for admin endpoints
4. **CORS**: Configure CORS settings if needed for your domain

## Cost Optimization

1. **Min Instances**: Set to 0 to scale to zero when not in use
2. **Max Instances**: Adjust based on expected traffic
3. **Memory/CPU**: Start with minimal resources and scale up as needed
4. **Region**: Choose a region close to your users

## Support

For issues with this deployment:

1. Check the [Google Cloud Run documentation](https://cloud.google.com/run/docs)
2. Review application logs
3. Verify environment variables are set correctly
4. Test the application locally with Docker

## Next Steps

After successful deployment:

1. Set up a custom domain (optional)
2. Configure monitoring and alerting
3. Set up CI/CD pipeline
4. Implement database persistence (if needed)
5. Add authentication and authorization
