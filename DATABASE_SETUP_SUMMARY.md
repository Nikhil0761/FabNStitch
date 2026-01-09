# 📊 FabNStitch Database Setup for Render

## Quick Summary

Your application uses **SQLite** database which stores all data in a single file: `fabnstitch.db`

---

## ✅ What's Already Done

- ✅ Database file exists (56 KB)
- ✅ Contains admin user (admin@fabnstitch.com / admin123)
- ✅ All tables and schema set up
- ✅ Data persists on disk (not in memory)
- ✅ Code is production-ready

---

## 🎯 Key Database Requirements for Render

### **CRITICAL:** Enable Persistent Disk

Without persistent disk, your database will be **deleted** on every deployment!

When creating your backend service on Render:

1. **Select Plan:** Starter ($7/month) - Required for persistent disk
2. **Add Disk:**
   - Name: `fabnstitch-data`
   - Mount Path: `/opt/render/project/src/backend`
   - Size: 1 GB (minimum)

This ensures your `fabnstitch.db` file survives across deployments.

---

## 🔧 Render Configuration

### Backend Service Settings

```yaml
Name: fabnstitch-backend
Root Directory: backend
Build Command: npm install
Start Command: node server.js
Instance Type: Starter ($7/month)
```

### Environment Variables

```
JWT_SECRET=adb97d415bffe848afae2e95e43f6c2396727625359596b1d2716c3f7c15d6dc
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://your-frontend.onrender.com
```

### Persistent Disk (REQUIRED!)

```
Name: fabnstitch-data
Mount Path: /opt/render/project/src/backend
Size: 1 GB
```

---

## 🧪 Verify Database After Deployment

Use Render Shell to check:

```bash
cd /opt/render/project/src/backend
ls -lh fabnstitch.db  # Should exist

# Check data
node -e "
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./fabnstitch.db');
db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
  console.log('Users:', row.count);
  db.close();
});
"
```

---

## 📦 Database Backup

### Manual Backup (Weekly Recommended)

```bash
# In Render Shell
cd /opt/render/project/src/backend
tar -czf backup-$(date +%Y%m%d).tar.gz fabnstitch.db
```

Download the backup file and store safely.

---

## 💰 Cost

- Backend with Persistent Disk: **$7/month**
- Frontend (Static): **FREE**
- **Total: $7/month**

---

## 🚨 Important Notes

1. **Don't skip persistent disk** - Your data will be lost!
2. **Test persistence** - Create test data, redeploy, check if data survives
3. **Backup regularly** - SQLite file can be easily backed up
4. **Monitor size** - 1 GB should be plenty for thousands of orders
5. **Migration path** - Easy to migrate to PostgreSQL later if needed

---

## 📚 Full Documentation

- Detailed guide: `RENDER_DEPLOYMENT_GUIDE.md`
- Run preparation script: `./prepare-deployment.sh`

---

## ✅ Success Checklist

- [ ] Render account created
- [ ] Code pushed to GitHub
- [ ] Backend deployed with persistent disk enabled
- [ ] Environment variables set
- [ ] Database verified in Render Shell
- [ ] Frontend deployed
- [ ] CORS updated with frontend URL
- [ ] Admin login tested
- [ ] Database persistence tested (redeploy test)

---

**You're ready! Start at: https://render.com** 🚀
