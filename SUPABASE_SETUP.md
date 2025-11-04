# Supabase Setup Guide for SlotSwapper

This guide will help you set up Supabase as your database for the SlotSwapper project.

## Why Supabase?

- ✅ Free PostgreSQL database in the cloud
- ✅ No local database setup required
- ✅ Easy deployment (works on any platform)
- ✅ Automatic backups
- ✅ Built-in authentication (optional to use later)
- ✅ Real-time capabilities

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email

## Step 2: Create a New Project

1. Click "New Project"
2. Fill in the details:
   - **Name**: `SlotSwapper` (or any name you prefer)
   - **Database Password**: Create a strong password (SAVE THIS - you'll need it!)
   - **Region**: Choose the closest region to you
   - **Pricing Plan**: Free tier is perfect for development
3. Click "Create new project"
4. Wait 2-3 minutes for your project to be provisioned

## Step 3: Get Your Database Connection String

1. In your Supabase project dashboard, click **"Project Settings"** (gear icon in the left sidebar)
2. Go to **"Database"** section
3. Scroll down to **"Connection string"**
4. Select **"URI"** tab
5. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with the actual password you created in Step 2

## Step 4: Configure Your Project

### For Windows (Local Development)

1. Open PowerShell and navigate to your backend folder:
   ```powershell
   cd "C:\Users\itssa\OneDrive\Desktop\GitHub Repos\SlotSwapper\backend"
   ```

2. Create a `.env` file:
   ```powershell
   @"
PORT=3001
NODE_ENV=development

DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000
"@ | Out-File -FilePath .env -Encoding UTF8
   ```

3. **Replace the DATABASE_URL** with your actual Supabase connection string from Step 3

### For Linux/Mac

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Create `.env` file:
   ```bash
   cat > .env << 'EOF'
PORT=3001
NODE_ENV=development

DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000
EOF
   ```

3. **Edit the file** and replace the DATABASE_URL with your actual connection string

## Step 5: Run Database Migrations

Now that your .env is configured with Supabase, run the migrations:

```bash
npm run migrate
```

You should see:
```
Running migrations...
Migrations completed successfully!
```

## Step 6: Start Your Development Server

```bash
npm run dev
```

You should see:
```
Server running on port 3001
```

## Step 7: Verify in Supabase Dashboard

1. Go back to your Supabase dashboard
2. Click on **"Table Editor"** in the left sidebar
3. You should see three tables created:
   - `users`
   - `events`
   - `swap_requests`

## Troubleshooting

### Error: "password authentication failed"
- Make sure you replaced `[YOUR-PASSWORD]` with your actual password
- The password should NOT have brackets around it
- Make sure there are no extra spaces in the connection string

### Error: "SSL connection required"
- This is already handled in the code! The database config has SSL enabled.
- If you still see this, make sure your connection string starts with `postgresql://` (not `postgres://`)

### Error: "too many connections"
- Free tier has connection limits
- Make sure you're not running multiple instances of the backend
- Restart your backend server

### Need to Reset Database?
1. Go to Supabase Dashboard -> Database -> Tables
2. Select all tables and delete them
3. Run `npm run migrate` again

## Production Deployment

When deploying to production (Render, Heroku, Vercel, etc.):

1. Add the `DATABASE_URL` environment variable in your hosting platform
2. Use the same Supabase connection string
3. Change `NODE_ENV=production`
4. Generate a new strong `JWT_SECRET`

### Example for Render.com

1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add environment variables:
   - `DATABASE_URL`: Your Supabase connection string
   - `JWT_SECRET`: A strong random string
   - `CORS_ORIGIN`: Your frontend URL (e.g., https://yourapp.vercel.app)

## Benefits of This Setup

✅ **No Docker needed** - Works on Windows, Mac, Linux without Docker
✅ **Same database everywhere** - Development and production use the same Supabase database
✅ **Easy collaboration** - Team members just need the connection string
✅ **Automatic backups** - Supabase handles this
✅ **Free tier generous** - 500MB database, 2GB bandwidth, 50,000 monthly active users

## Optional: Use Supabase SQL Editor

You can run SQL queries directly in Supabase:

1. Go to **"SQL Editor"** in Supabase dashboard
2. Write and execute SQL queries
3. Great for debugging or manual data entry

Example queries:
```sql
-- View all users
SELECT * FROM users;

-- View all events
SELECT * FROM events;

-- View all swap requests with user details
SELECT 
  sr.*,
  u1.name as requester_name,
  u2.name as target_name
FROM swap_requests sr
JOIN users u1 ON sr.requester_id = u1.id
JOIN users u2 ON sr.target_user_id = u2.id;
```

## Security Best Practices

🔒 **Never commit your `.env` file to Git** - It's already in `.gitignore`
🔒 **Use different databases for dev/staging/prod** - Create separate Supabase projects
🔒 **Rotate your JWT_SECRET regularly** in production
🔒 **Use environment variables** on all hosting platforms
🔒 **Enable Row Level Security (RLS)** in Supabase for extra security (optional advanced feature)

## Need Help?

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Check the main SETUP.txt file in the project root

---

**You're all set!** 🎉 Your SlotSwapper project now uses Supabase and will work seamlessly in development and production.
