# 🚀 Quick Fix for Database Connection Error

## Your Error
```
Error: getaddrinfo ENOTFOUND db.okzedddhigfhkaxobezi.supabase.co
```
or
```
Error: connect ENETUNREACH 2406:da1a:6b0:f615:6fc1:48f9:da66:5334:5432
```

## The Problem
Your Supabase database only supports IPv6, but your network doesn't have IPv6 connectivity.

## The Fix (2 Minutes) ⚡

### Step 1: Get Connection Pooler URL

1. Open: https://supabase.com/dashboard
2. Click your **SlotSwapper** project
3. Click **"Project Settings"** (⚙️ gear icon)
4. Click **"Database"**
5. Scroll to **"Connection Pooling"** section
6. Find **"Transaction Mode"** connection string
7. **Copy** the connection string (it should include `pooler.supabase.com`)

Example format:
```
postgresql://postgres.okzedddhigfhkaxobezi:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### Step 2: Update Your .env File

**Location**: `backend/.env` (in this workspace, it's already created for you!)

**In this workspace**, the file is at: `/workspace/backend/.env`

**On your local machine**, the file is at:
- Windows: `C:\Users\itssa\OneDrive\Desktop\GitHub Repos\SlotSwapper\backend\.env`
- Mac/Linux: `~/path/to/SlotSwapper/backend/.env`

**Replace the DATABASE_URL line** with the pooler URL you copied:

```env
DATABASE_URL=postgresql://postgres.okzedddhigfhkaxobezi:Bennett%40%2389293423824234@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Important:** 
- Replace `[YOUR-PASSWORD]` with `Bennett%40%2389293423824234` (your password URL-encoded)
- Keep the `%40%23` encoding (these are special characters)
- Change `aws-0-ap-southeast-1` to match YOUR region from the pooler URL

### Step 3: Restart Your Server

**Stop** the current server (Ctrl+C)

**Start** it again:
```bash
cd backend
npm run dev
```

## What You Should See ✅

If successful, you'll see:
```
🚀 Starting SlotSwapper Backend...

🔄 Testing database connection (attempt 1/3)...
✅ Database connected successfully!
   Time: 2025-11-04 19:55:53.123
   PostgreSQL version: 15.1

✅ Server running on port 3001
📡 CORS enabled for: http://localhost:3000
🔐 JWT expiration: 7d

👉 API available at: http://localhost:3001
👉 Health check: http://localhost:3001/health
```

## Still Having Issues? 🔧

### Error: "Authentication failed"
- Double-check your password in the connection string
- Verify special characters are URL-encoded:
  - `@` = `%40`
  - `#` = `%23`

### Error: "Project is paused"
1. Go to https://supabase.com/dashboard
2. Click your project
3. Click "Restore project"
4. Wait 1-2 minutes
5. Try again

### Error: "Could not find pooler URL"
- Make sure you're looking at "Connection Pooling" section (not "Connection string")
- It should say "Transaction mode" or "Session mode"
- The URL should contain `pooler.supabase.com`

## Why This Works

| Direct Connection | Connection Pooler |
|------------------|-------------------|
| ❌ IPv6 only | ✅ IPv4 + IPv6 |
| ❌ Fails on many networks | ✅ Works everywhere |
| ❌ Limited connections | ✅ More connections |
| ❌ No automatic retry | ✅ Built-in resilience |

## More Help

- **Detailed IPv6 Fix**: See `backend/IPV6_FIX.md`
- **Full Setup Guide**: See `SUPABASE_SETUP.md`
- **Connection Improvements**: See `backend/DATABASE_CONNECTION_IMPROVEMENTS.md`

---

**Fix it in 2 minutes** → Get pooler URL → Update .env → Restart server → Done! 🎉
