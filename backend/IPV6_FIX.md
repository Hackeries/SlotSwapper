# Fix for IPv6 Database Connection Error

## Problem
Your Supabase database only supports IPv6, but your environment (or Windows) doesn't have IPv6 connectivity enabled. This causes the error:
```
Error: connect ENETUNREACH 2406:da1a:6b0:f615:6fc1:48f9:da66:5334:5432
```

## Solution: Use Supabase Connection Pooler (IPv4 Supported)

Supabase provides a connection pooler called **Supavisor** that supports both IPv4 and IPv6. This is the recommended solution!

### Step 1: Get Your Connection Pooler URL

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click on your **SlotSwapper** project
3. Click **"Project Settings"** (gear icon) in the left sidebar
4. Go to **"Database"** section
5. Scroll down to **"Connection Pooling"** section
6. You'll see connection strings for different modes. Choose one:
   - **Transaction mode** (Port 6543) - Recommended for most apps
   - **Session mode** (Port 5432) - For apps that need session-level features

7. The pooler connection string looks like:
   ```
   postgresql://postgres.okzedddhigfhkaxobezi:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

### Step 2: Update Your .env File

1. Open `backend/.env`
2. Replace the old DATABASE_URL with the new pooler URL
3. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with your actual database password

Before:
```env
DATABASE_URL=postgresql://postgres:Bennett%40%2389293423824234@db.okzedddhigfhkaxobezi.supabase.co:5432/postgres
```

After (Transaction mode - Port 6543):
```env
DATABASE_URL=postgresql://postgres.okzedddhigfhkaxobezi:Bennett%40%2389293423824234@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### Step 3: Restart Your Server

```bash
# Stop the current server (Ctrl+C if running)
# Then restart
npm run dev
```

You should now see:
```
✅ Database connected successfully!
```

## Why This Works

- **Direct Connection**: Uses IPv6 → ❌ Fails on many networks
- **Connection Pooler**: Uses IPv4 AND IPv6 → ✅ Works everywhere
- **Bonus**: Connection pooling is faster and handles more concurrent connections!

## Alternative Solution: Create New Supabase Project

If you want to create a new project with IPv4 support:

1. Create a new Supabase project
2. Choose a region known to support IPv4:
   - **US East** (us-east-1)
   - **US West** (us-west-1)
   - **Europe West** (eu-west-1)
3. Get the connection string and update your `.env`
4. Run migrations: `npm run migrate`

## How to Check If It's Working

Test the connection:
```bash
cd backend
npx ts-node test-connection.ts
```

If successful, you'll see:
```
✅ Database connected successfully!
   Time: [timestamp]
   PostgreSQL version: [version]
```

## Connection Pooler Benefits

✅ **IPv4 + IPv6 support** - Works everywhere  
✅ **Better performance** - Reuses database connections  
✅ **More concurrent connections** - Pooling allows more users  
✅ **Automatic failover** - Built-in resilience  

## Troubleshooting

### Still getting connection errors?

1. **Verify your password** is URL-encoded properly:
   - `@` becomes `%40`
   - `#` becomes `%23`
   - `!` becomes `%21`

2. **Check the pooler URL** is correct:
   - Should have `pooler.supabase.com` in the hostname
   - Port should be `6543` (Transaction mode) or `5432` (Session mode)
   - Project reference should match your project

3. **Verify your Supabase project is active**:
   - Projects pause after inactivity on free tier
   - Go to dashboard and check project status

### Need More Help?

- Supabase Docs: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler
- Discord: https://discord.supabase.com

---

**You're all set!** 🎉 Using the connection pooler will fix your IPv6 issues and provide better performance.
