#!/bin/bash

# UniPivot Deployment Script
# Usage: ./deploy.sh

set -e

# Configuration
PROJECT_DIR="/var/www/unihome-v2"
NODE_VERSION="20"
PM2_APP_NAME="unipivot"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== UniPivot Deployment ===${NC}"
echo "Starting deployment at $(date)"
echo ""

# Navigate to project directory
cd "$PROJECT_DIR"

# Pull latest changes (if using git)
if [ -d ".git" ]; then
    echo -e "${YELLOW}Pulling latest changes...${NC}"
    git pull origin main
    echo -e "${GREEN}Git pull complete${NC}"
    echo ""
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
pnpm install --frozen-lockfile
echo -e "${GREEN}Dependencies installed${NC}"
echo ""

# Generate Prisma client
echo -e "${YELLOW}Generating Prisma client...${NC}"
npx prisma generate
echo -e "${GREEN}Prisma client generated${NC}"
echo ""

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
npx prisma db push
echo -e "${GREEN}Database migrations complete${NC}"
echo ""

# Build the application
echo -e "${YELLOW}Building application...${NC}"
pnpm build
echo -e "${GREEN}Build complete${NC}"
echo ""

# Restart PM2 application
echo -e "${YELLOW}Restarting PM2 application...${NC}"
if pm2 describe "$PM2_APP_NAME" > /dev/null 2>&1; then
    pm2 reload "$PM2_APP_NAME"
    echo -e "${GREEN}Application reloaded${NC}"
else
    pm2 start ecosystem.config.js --env production
    pm2 save
    echo -e "${GREEN}Application started${NC}"
fi
echo ""

# Show application status
echo -e "${BLUE}=== Deployment Complete ===${NC}"
echo ""
pm2 status "$PM2_APP_NAME"
echo ""
echo -e "${GREEN}Deployment finished at $(date)${NC}"

# Optional: Clear Next.js cache
# rm -rf .next/cache

# Optional: Reload Nginx
# sudo systemctl reload nginx
