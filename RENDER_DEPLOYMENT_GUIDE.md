# 🚀 FabNStitch Deployment Guide - Render with SQLite

## 📋 Overview

This guide will help you deploy FabNStitch to Render with SQLite database persistence.

**Timeline:** 1-2 hours  
**Cost:** $7/month (for persistent disk)  
**Difficulty:** Beginner-friendly

---

## 🗄️ Database Setup for Render

### Important Notes:
- ✅ SQLite will work on Render with **Persistent Disk** enabled
- ✅ Your data will survive restarts and redeployments
- ⚠️ You MUST enable persistent disk ($7/month) or data will be lost
- ✅ Your current `fabnstitch.db` file will be uploaded and used

---

## 📝 Pre-Deployment Checklist

### Step 1: Prepare Your Code

1. **Create `.gitignore` files** (if not already present)

Backend `.gitignore`:
```
node_modules/
.env
*.db
*.log
```

Frontend `.gitignore`:
```
node_modules/
dist/
.env
.env.local
```

2. **Update CORS configuration** in `backend/server.js`

Replace the CORS section with:
```javascript
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Local development
      "https://your-frontend-url.onrender.com", // Replace with actual URL after deployment
    ],
    credentials: true,
  })
);
```

3. **Update frontend API URL** in `frontend/src/config/api.js`

Replace with:
```javascript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
```

4. **Add frontend environment variable file**

Create `frontend/.env.production`:
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## 🔧 Step-by-Step Deployment

### Phase 1: Prepare Database File

**Option A: Start Fresh (Recommended for First Deployment)**

1. Your existing `fabnstitch.db` has test data
2. You can either:
   - Keep it (includes admin user: admin@fabnstitch.com / admin123)
   - Or create a fresh one (will need to run migrations)

**Option B: Keep Current Database**

Your current database already has:
- ✅ Admin user (admin@fabnstitch.com)
- ✅ Schema set up
- ✅ Test data

**Decision:** Let's keep the current database for easier deployment.

---

### Phase 2: Backend Deployment on Render

#### 1. Create Render Account
- Go to https://render.com
- Sign up with GitHub/GitLab/Email
- Free account works, but you'll need paid plan for persistent disk

#### 2. Push Code to Git

```bash
# Initialize git if not already done
cd /home/nikhilkori/Personal_project/FabNStitch
git init
git add .
git commit -m "Initial commit for deployment"

# Create GitHub repository and push
# Follow GitHub's instructions to push to your new repo
```

#### 3. Create Web Service on Render

1. **Dashboard** → Click "New +" → **Web Service**

2. **Connect Repository:**
   - Connect your GitHub account
   - Select your FabNStitch repository
   - Click "Connect"

3. **Configure Service:**

   | Setting | Value |
   |---------|-------|
   | **Name** | `fabnstitch-backend` |
   | **Region** | Choose closest to you |
   | **Branch** | `main` (or `master`) |
   | **Root Directory** | `backend` |
   | **Environment** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Plan** | **Starter ($7/month)** ⚠️ Required for persistent disk |

4. **Add Environment Variables:**

   Click "Advanced" → "Add Environment Variable"

   | Key | Value |
   |-----|-------|
   | `JWT_SECRET` | `your-super-secret-jwt-key-change-this-in-production-12345` |
   | `NODE_ENV` | `production` |
   | `PORT` | `5001` |

   **Important:** Generate a strong JWT_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Configure Persistent Disk:** ⚠️ **CRITICAL FOR DATABASE**

   Scroll down to **"Disk"** section:
   
   - Click **"Add Disk"**
   - **Name:** `fabnstitch-data`
   - **Mount Path:** `/opt/render/project/src/backend`
   - **Size:** 1 GB (minimum, can increase later)
   - Click **"Create Disk"**

   This ensures your `fabnstitch.db` file persists across deployments!

6. **Create Service**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

#### 4. Upload Database File

After first deployment:

**Option A: Using Render Shell (Recommended)**

1. Go to your service dashboard
2. Click **"Shell"** tab
3. Run these commands:

```bash
cd /opt/render/project/src/backend
ls -la  # Check current files

# Initialize database with schema
node database/init.js

# Check if database was created
ls -la *.db
```

**Option B: Let it Auto-Create**

Your `database/init.js` will automatically create the database on first run with the correct schema. You'll just need to create the admin user.

#### 5. Create Admin User (if fresh database)

If starting fresh, use Render Shell:

```bash
cd /opt/render/project/src/backend
node -e "
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./fabnstitch.db');

const password = bcrypt.hashSync('admin123', 10);
db.run(
  'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
  ['Admin', 'admin@fabnstitch.com', password, 'admin', '1234567890'],
  (err) => {
    if (err) console.error(err);
    else console.log('✅ Admin user created');
    db.close();
  }
);
"
```

#### 6. Test Backend

- Your backend URL: `https://your-service-name.onrender.com`
- Test health endpoint: `https://your-service-name.onrender.com/api/health`
- Should return: `{"status":"ok"}`

---

### Phase 3: Frontend Deployment on Render

#### 1. Create Static Site

1. **Dashboard** → Click "New +" → **Static Site**

2. **Connect Repository:**
   - Select same FabNStitch repository

3. **Configure Static Site:**

   | Setting | Value |
   |---------|-------|
   | **Name** | `fabnstitch-frontend` |
   | **Branch** | `main` |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm install && npm run build` |
   | **Publish Directory** | `dist` |

4. **Add Environment Variable:**

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://your-backend-name.onrender.com/api` |

   ⚠️ Replace with your actual backend URL from Phase 2

5. **Create Static Site**
   - Click "Create Static Site"
   - Wait for deployment (5-10 minutes)

---

### Phase 4: Update CORS

After both services are deployed:

1. Note your frontend URL: `https://fabnstitch-frontend.onrender.com`
2. Update `backend/server.js` CORS configuration:

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://fabnstitch-frontend.onrender.com", // Your actual frontend URL
    ],
    credentials: true,
  })
);
```

3. Push changes:
```bash
git add backend/server.js
git commit -m "Update CORS for production"
git push
```

4. Render will auto-redeploy backend

---

## ✅ Post-Deployment Verification

### Test Checklist:

1. **Backend Health Check**
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Frontend Access**
   - Visit: `https://your-frontend.onrender.com`
   - Should see homepage

3. **Admin Login**
   - Go to: `https://your-frontend.onrender.com/admin`
   - Login: `admin@fabnstitch.com` / `admin123`
   - Should access dashboard

4. **Test Data Persistence**
   - Create a test customer from admin panel
   - Trigger a redeploy on Render
   - Check if customer still exists
   - ✅ If yes, persistence is working!

5. **Test Lead Submission**
   - Fill homepage "Get Started" form
   - Check admin panel → Website Leads
   - Should appear immediately

---

## 🔄 Database Backup Strategy

### Manual Backup (Recommended Weekly)

1. **Download Database via Render Shell:**

```bash
# In Render Shell
cd /opt/render/project/src/backend
cat fabnstitch.db | base64
```

2. Copy the base64 output
3. On local machine:
```bash
echo "BASE64_OUTPUT_HERE" | base64 -d > backup-$(date +%Y%m%d).db
```

### Automated Backup Script

Create `backend/backup-db.js`:

```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'fabnstitch.db');
const backupDir = path.join(__dirname, 'backups');

// Create backups directory
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Create backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `backup-${timestamp}.db`);

fs.copyFileSync(dbPath, backupPath);
console.log(`✅ Backup created: ${backupPath}`);
```

Run manually or set up cron job on Render.

---

## 📊 Monitoring Database

### Check Database Size

```bash
# In Render Shell
du -h fabnstitch.db
```

### Check Table Row Counts

```bash
# In Render Shell
node -e "
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./fabnstitch.db');

const tables = ['users', 'orders', 'leads', 'tickets', 'measurements'];
tables.forEach(table => {
  db.get(\`SELECT COUNT(*) as count FROM \${table}\`, (err, row) => {
    if (!err) console.log(\`\${table}: \${row.count} rows\`);
  });
});

setTimeout(() => db.close(), 1000);
"
```

---

## 🚨 Troubleshooting

### Problem: Database resets after redeploy

**Cause:** Persistent disk not configured or wrong mount path

**Solution:**
1. Check Disk settings in Render dashboard
2. Verify mount path is: `/opt/render/project/src/backend`
3. Ensure disk is attached to the service

### Problem: "Database is locked" errors

**Cause:** SQLite doesn't handle concurrent writes well

**Solution:**
1. This is normal for SQLite under load
2. Consider migrating to PostgreSQL if you see this often
3. Or reduce concurrent request load

### Problem: CORS errors in browser console

**Cause:** Frontend URL not in CORS whitelist

**Solution:**
1. Update `backend/server.js` CORS configuration
2. Add your frontend URL
3. Push and redeploy

### Problem: Environment variables not working

**Cause:** Not set in Render dashboard

**Solution:**
1. Go to service → Environment
2. Add all required variables
3. Trigger manual redeploy

---

## 💰 Costs Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Backend (with persistent disk) | Starter | $7/month |
| Frontend (static site) | Free | $0/month |
| **Total** | | **$7/month** |

---

## 🎯 Next Steps After Deployment

1. **Set up custom domain** (optional)
   - Render supports custom domains
   - Follow Render's domain setup guide

2. **Enable automatic backups** (recommended)
   - Set up weekly manual backups
   - Store backups in Google Drive/Dropbox

3. **Monitor performance**
   - Check Render metrics dashboard
   - Watch for errors in logs

4. **Plan for scaling**
   - When you hit 100+ users, migrate to PostgreSQL
   - Render makes this easy with managed PostgreSQL

5. **Add email notifications** (optional)
   - Integrate SendGrid or Resend
   - Send order confirmations, updates, etc.

---

## 📞 Support

**Render Documentation:**
- https://render.com/docs
- https://render.com/docs/disks

**FabNStitch Issues:**
- Check backend logs in Render dashboard
- Use Render Shell for debugging
- Database issues: verify persistent disk is mounted

---

## ✅ Success Criteria

Your deployment is successful when:

- ✅ Backend responds at `/api/health`
- ✅ Frontend loads correctly
- ✅ Admin can login
- ✅ Can create customers/orders
- ✅ Data persists after redeploy
- ✅ Website leads are captured
- ✅ No CORS errors

---

**Ready to deploy? Follow the steps above and you'll be live in 1-2 hours!** 🚀
