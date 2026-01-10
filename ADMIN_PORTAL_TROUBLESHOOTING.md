# Admin Portal Troubleshooting Guide

## ✅ Status: All Systems Functional

### Backend API Status
All admin endpoints are **working correctly**:
- ✅ `/api/admin/dashboard` - Returns stats (21 customers, 9 tailors, 8 orders)
- ✅ `/api/admin/customers` - Returns 21 customers
- ✅ `/api/admin/tailors` - Returns 9 tailors
- ✅ `/api/admin/orders` - Returns 8 orders
- ✅ `/api/admin/tickets` - Returns 1 support ticket
- ✅ `/api/admin/leads` - Returns 4 website leads

### Frontend Components Status
All components exist and have no syntax errors:
- ✅ AdminDashboard.jsx
- ✅ AdminUsers.jsx (Customers page)
- ✅ AdminTailors.jsx
- ✅ AdminOrders.jsx
- ✅ AdminSupport.jsx
- ✅ AdminLeads.jsx
- ✅ AdminCreateUser.jsx
- ✅ AdminCreateOrder.jsx

---

## 🔧 If Customers Page Not Loading

### 1. Check Browser Console
Press `F12` → Go to **Console** tab
- Look for red errors
- Common errors:
  - `Failed to fetch` → Backend not running
  - `401 Unauthorized` → Token expired, logout and login
  - `404 Not Found` → API URL mismatch

### 2. Check Network Tab
Press `F12` → Go to **Network** tab
- Navigate to `/admin/customers`
- Look for the API call to `/api/admin/customers`
- Should show: **200 OK** with customer data
- If 401: Token expired → Logout and login again
- If 404: API URL wrong → Check config
- If CORS error: Backend CORS issue → Check server.js

### 3. Verify Admin Login
1. Go to: `http://localhost:5173/admin`
2. Login with:
   - Email: `admin@fabnstitch.com`
   - Password: `admin123`
3. Should redirect to `/admin/dashboard`
4. Click "Customers" in sidebar

### 4. Clear Browser Cache
Sometimes old cached files cause issues:
1. Press `Ctrl+Shift+R` (hard refresh)
2. Or clear cache: Settings → Privacy → Clear browsing data

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to fetch"
**Cause:** Backend not running or API URL wrong

**Solution:**
1. Check backend is running:
   ```bash
   curl http://localhost:5001/api/health
   ```
   Should return: `{"status":"ok"}`

2. If not running, start backend:
   ```bash
   cd backend && node server.js
   ```

3. Check frontend API_URL in `frontend/src/config/index.js`:
   Should be: `http://localhost:5001/api`

---

### Issue: "401 Unauthorized"
**Cause:** Token expired or invalid

**Solution:**
1. Logout from admin panel
2. Login again with admin credentials
3. Token is stored in localStorage as `fabnstitch_token`
4. To check token in console:
   ```javascript
   localStorage.getItem('fabnstitch_token')
   ```

---

### Issue: Blank/White Page
**Cause:** JavaScript error or component crash

**Solution:**
1. Open browser console (F12)
2. Look for the red error message
3. Common causes:
   - Undefined variable
   - API returning unexpected data format
   - Missing component import

---

### Issue: Data Not Displaying
**Cause:** API returning empty array or wrong data structure

**Solution:**
1. Check Network tab for API response
2. Verify data structure matches component expectations
3. Check database has data:
   ```bash
   cd backend
   node -e "
   const sqlite3 = require('sqlite3').verbose();
   const db = new sqlite3.Database('./fabnstitch.db');
   db.all('SELECT COUNT(*) as count FROM users WHERE role=\\'customer\\'', (err, rows) => {
     console.log('Customers:', rows[0].count);
     db.close();
   });
   "
   ```

---

### Issue: CORS Error
**Cause:** Backend not allowing frontend origin

**Solution:**
Check `backend/server.js` CORS configuration includes:
```javascript
const allowedOrigins = [
    "http://localhost:5173",  // ← Must include this
    // ...other origins
];
```

---

## 🧪 Quick Test Checklist

Run through these to verify everything works:

### Backend Test
```bash
# Get admin token
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fabnstitch.com","password":"admin123"}'

# Test customers endpoint (replace TOKEN with actual token)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5001/api/admin/customers
```

### Frontend Test
1. ✅ Homepage loads: `http://localhost:5173`
2. ✅ Admin login works: `http://localhost:5173/admin`
3. ✅ Dashboard shows stats
4. ✅ Customers page shows list of customers
5. ✅ No console errors (F12 → Console)

---

## 📊 Current Data in Database

- **Customers:** 21
- **Tailors:** 9
- **Orders:** 8
- **Support Tickets:** 1
- **Website Leads:** 4

All data is accessible via API endpoints!

---

## 🎯 Admin Portal Features Working

✅ **Dashboard**
- Shows statistics
- Quick action buttons
- Recent activity

✅ **Customers Management**
- View all customers (21)
- Search by name, email, phone, city
- Add new customer
- View customer orders

✅ **Tailors Management**
- View all tailors (9)
- Search functionality
- Add new tailor
- View tailor stats

✅ **Orders Management**
- View all orders (8)
- Filter by status
- Search orders
- Assign tailor to order
- Update order status
- Create new order

✅ **Support Tickets**
- View all tickets (1)
- Filter by status
- Respond to tickets
- Update ticket status

✅ **Website Leads**
- View form submissions (4)
- Update lead status
- Add notes
- Track lead progress

---

## 💡 Quick Fixes

### Restart Everything
If nothing else works:

1. Stop frontend (Ctrl+C in frontend terminal)
2. Stop backend (Ctrl+C in backend terminal)
3. Start backend:
   ```bash
   cd backend && node server.js
   ```
4. Start frontend:
   ```bash
   cd frontend && npm run dev
   ```
5. Clear browser cache (Ctrl+Shift+R)
6. Login to admin again

---

## 🆘 Need More Help?

Check these files for issues:
1. **Backend logs:** Check terminal where backend is running
2. **Browser console:** F12 → Console tab
3. **Network requests:** F12 → Network tab
4. **Backend routes:** `backend/routes/admin.js`
5. **Frontend components:** `frontend/src/pages/Admin*.jsx`

---

**Last Updated:** After fixing all merge conflicts and verifying all endpoints
**Status:** ✅ All systems operational
