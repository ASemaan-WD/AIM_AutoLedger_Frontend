#!/bin/bash

# Vercel Deployment Script
# Deploys the ACOM AIM FE application with OCR fixes

set -e  # Exit on error

echo "======================================"
echo "🚀 ACOM AIM FE - Vercel Deployment"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found!${NC}"
    echo ""
    echo "Install it with:"
    echo "  npm install -g vercel"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI found${NC}"
echo ""

# Check current Vercel authentication
echo "🔐 Checking Vercel authentication..."
if vercel whoami &> /dev/null; then
    VERCEL_USER=$(vercel whoami)
    echo -e "${GREEN}✅ Logged in as: $VERCEL_USER${NC}"
else
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo "Please log in:"
    vercel login
fi
echo ""

# Show current git status
echo "📋 Git Status:"
git status --short
echo ""

# Ask if user wants to commit changes
read -p "Do you want to commit current changes? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📝 Committing changes..."
    git add .
    read -p "Enter commit message: " COMMIT_MSG
    git commit -m "$COMMIT_MSG"
    echo -e "${GREEN}✅ Changes committed${NC}"
    echo ""
fi

# Ask about deployment type
echo "Select deployment type:"
echo "  1) Production (main branch)"
echo "  2) Preview (current branch)"
echo "  3) Development (local only)"
read -p "Enter choice (1-3): " -n 1 -r DEPLOY_TYPE
echo ""
echo ""

case $DEPLOY_TYPE in
    1)
        echo "🚀 Deploying to PRODUCTION..."
        echo ""
        
        # Push to main first
        CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
        if [ "$CURRENT_BRANCH" != "main" ]; then
            echo -e "${YELLOW}⚠️  You're on branch: $CURRENT_BRANCH${NC}"
            read -p "Push to main branch? (y/n) " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git checkout main
                git merge "$CURRENT_BRANCH"
                git push origin main
                echo -e "${GREEN}✅ Pushed to main${NC}"
            else
                echo -e "${RED}❌ Cancelled${NC}"
                exit 1
            fi
        else
            git push origin main
        fi
        
        # Deploy to production
        vercel --prod
        ;;
        
    2)
        echo "🔍 Deploying PREVIEW..."
        echo ""
        vercel
        ;;
        
    3)
        echo "💻 Starting DEVELOPMENT server..."
        echo ""
        vercel dev
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "======================================"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "======================================"
echo ""

# Get deployment URL
echo "🔗 Getting deployment URL..."
DEPLOY_URL=$(vercel inspect --json | grep -o '"url":"[^"]*' | cut -d'"' -f4)
echo ""
echo -e "${GREEN}Deployment URL: https://$DEPLOY_URL${NC}"
echo ""

# Test the deployment
echo "🧪 Testing deployment..."
echo ""

# Health check
echo "1. Health check..."
HEALTH_URL="https://$DEPLOY_URL/api/ocr2/process"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "   ${GREEN}✅ OCR API is healthy${NC}"
else
    echo -e "   ${RED}❌ OCR API returned: $HTTP_CODE${NC}"
fi

# Check homepage
echo "2. Homepage check..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOY_URL")

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "   ${GREEN}✅ Homepage is accessible${NC}"
else
    echo -e "   ${YELLOW}⚠️  Homepage returned: $HTTP_CODE${NC}"
fi

echo ""
echo "======================================"
echo "📊 Post-Deployment Checklist"
echo "======================================"
echo ""
echo "1. Verify environment variables in Vercel Dashboard:"
echo "   - OPENAI_API_KEY"
echo "   - OPENAI_TIMEOUT_SECONDS=55"
echo "   - AIRTABLE_PAT"
echo "   - AIRTABLE_BASE_ID"
echo "   - MAX_VISION_RETRIES=0"
echo ""
echo "2. Test file upload:"
echo "   - Go to: https://$DEPLOY_URL"
echo "   - Upload a test PDF"
echo "   - Monitor logs: vercel logs --follow"
echo ""
echo "3. Check Airtable records"
echo ""
echo "4. Review deployment logs:"
echo "   vercel logs"
echo ""
echo -e "${GREEN}📚 See VERCEL_DEPLOYMENT_CHECKLIST.md for detailed steps${NC}"
echo ""

