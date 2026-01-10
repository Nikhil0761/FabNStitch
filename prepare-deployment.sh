#!/bin/bash

# FabNStitch Render Deployment Preparation Script
# This script helps you prepare your application for Render deployment

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║          FabNStitch - Render Deployment Preparation               ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the project root
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Pre-Deployment Checklist${NC}"
echo ""

# 1. Check Git
echo -e "${YELLOW}[1/7] Checking Git repository...${NC}"
if [ -d ".git" ]; then
    echo -e "${GREEN}✅ Git repository exists${NC}"
else
    echo -e "${RED}❌ Git repository not initialized${NC}"
    echo "   Run: git init"
fi
echo ""

# 2. Check .gitignore
echo -e "${YELLOW}[2/7] Checking .gitignore files...${NC}"
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✅ Root .gitignore exists${NC}"
else
    echo -e "${RED}❌ Root .gitignore missing${NC}"
    echo "   Creating .gitignore..."
    cat > .gitignore << 'EOF'
node_modules/
.env
*.db
*.log
.DS_Store
dist/
EOF
    echo -e "${GREEN}✅ Created root .gitignore${NC}"
fi

if [ -f "backend/.gitignore" ]; then
    echo -e "${GREEN}✅ Backend .gitignore exists${NC}"
else
    echo -e "${YELLOW}⚠️  Backend .gitignore missing${NC}"
    echo "   Creating backend/.gitignore..."
    cat > backend/.gitignore << 'EOF'
node_modules/
.env
*.db
*.log
.DS_Store
EOF
    echo -e "${GREEN}✅ Created backend/.gitignore${NC}"
fi

if [ -f "frontend/.gitignore" ]; then
    echo -e "${GREEN}✅ Frontend .gitignore exists${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend .gitignore missing${NC}"
    echo "   Creating frontend/.gitignore..."
    cat > frontend/.gitignore << 'EOF'
node_modules/
dist/
.env
.env.local
.DS_Store
EOF
    echo -e "${GREEN}✅ Created frontend/.gitignore${NC}"
fi
echo ""

# 3. Check package.json files
echo -e "${YELLOW}[3/7] Checking package.json files...${NC}"
if [ -f "backend/package.json" ]; then
    echo -e "${GREEN}✅ Backend package.json exists${NC}"
else
    echo -e "${RED}❌ Backend package.json missing${NC}"
fi

if [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✅ Frontend package.json exists${NC}"
else
    echo -e "${RED}❌ Frontend package.json missing${NC}"
fi
echo ""

# 4. Check environment variables
echo -e "${YELLOW}[4/7] Checking environment configuration...${NC}"
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ Backend .env exists${NC}"
    if grep -q "JWT_SECRET" backend/.env; then
        echo -e "${GREEN}✅ JWT_SECRET is set${NC}"
    else
        echo -e "${RED}❌ JWT_SECRET not found in .env${NC}"
    fi
else
    echo -e "${RED}❌ Backend .env missing${NC}"
    echo "   Create backend/.env with JWT_SECRET"
fi
echo ""

# 5. Check database
echo -e "${YELLOW}[5/7] Checking database...${NC}"
if [ -f "backend/fabnstitch.db" ]; then
    DB_SIZE=$(du -h backend/fabnstitch.db | cut -f1)
    echo -e "${GREEN}✅ Database exists (${DB_SIZE})${NC}"
else
    echo -e "${YELLOW}⚠️  Database doesn't exist yet${NC}"
    echo "   It will be created automatically on first run"
fi
echo ""

# 6. Check build configuration
echo -e "${YELLOW}[6/7] Checking build configuration...${NC}"
if [ -f "frontend/vite.config.js" ]; then
    echo -e "${GREEN}✅ Vite config exists${NC}"
else
    echo -e "${RED}❌ Vite config missing${NC}"
fi
echo ""

# 7. Test builds
echo -e "${YELLOW}[7/7] Testing builds...${NC}"
echo "   Testing backend dependencies..."
cd backend
if npm list --depth=0 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend dependencies OK${NC}"
else
    echo -e "${YELLOW}⚠️  Some backend dependencies might be missing${NC}"
    echo "   Run: cd backend && npm install"
fi

cd ../frontend
echo "   Testing frontend dependencies..."
if npm list --depth=0 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend dependencies OK${NC}"
else
    echo -e "${YELLOW}⚠️  Some frontend dependencies might be missing${NC}"
    echo "   Run: cd frontend && npm install"
fi

cd ..
echo ""

# Generate JWT Secret
echo -e "${BLUE}🔑 JWT Secret Generator${NC}"
echo ""
echo "For production, use this secure JWT_SECRET:"
echo -e "${GREEN}$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")${NC}"
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                          Next Steps                                ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "1. Create a GitHub repository and push your code:"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git remote add origin YOUR_GITHUB_REPO_URL"
echo "   git push -u origin main"
echo ""
echo "2. Go to https://render.com and sign up/login"
echo ""
echo "3. Follow the deployment guide in RENDER_DEPLOYMENT_GUIDE.md"
echo ""
echo "4. Key environment variables to set on Render:"
echo "   Backend:"
echo "   - JWT_SECRET (generate a new one above)"
echo "   - NODE_ENV=production"
echo "   - PORT=5001"
echo "   - FRONTEND_URL=https://your-frontend.onrender.com"
echo ""
echo "   Frontend:"
echo "   - VITE_API_URL=https://your-backend.onrender.com/api"
echo ""
echo "5. Enable Persistent Disk on Render for database persistence!"
echo "   - Mount path: /opt/render/project/src/backend"
echo "   - Size: 1GB minimum"
echo ""
echo -e "${GREEN}✅ Preparation complete! Ready to deploy.${NC}"
echo ""
