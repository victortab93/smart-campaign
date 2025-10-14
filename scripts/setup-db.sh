#!/bin/bash

# SmartCampaign Database Setup Script
# This script sets up the PostgreSQL database for the SmartCampaign application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up SmartCampaign Database...${NC}"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL environment variable is not set${NC}"
    echo "Please set DATABASE_URL in your .env.local file"
    echo "Example: DATABASE_URL=postgresql://username:password@localhost:5432/smartcampaign"
    exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ psql command not found. Please install PostgreSQL client tools.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Creating database schema...${NC}"
psql "$DATABASE_URL" -f database/schema.sql

echo -e "${YELLOW}🌱 Seeding database with initial data...${NC}"
psql "$DATABASE_URL" -f database/seed.sql

echo -e "${GREEN}✅ Database setup completed successfully!${NC}"
echo -e "${GREEN}🎉 You can now start the application with: npm run dev${NC}"

