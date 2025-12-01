# Deploying to Vercel

This guide will walk you through deploying your Journal application to Vercel.

## Prerequisites

- A GitHub, GitLab, or Bitbucket account
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A Neon database (already set up)

## Step 1: Push to Git Repository

### Option A: Create a new GitHub repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Don't initialize it with a README (you already have one)

3. In your terminal, run:

```bash
# Add your GitHub repository as remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git

# Push your code
git branch -M main
git push -u origin main
```

### Option B: If you already have a remote

```bash
# Check current remotes
git remote -v

# If you need to update the remote URL:
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push your code
git push -u origin main
```

## Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository:
   - If you use GitHub, click **"Import"** next to your repository
   - Authorize Vercel to access your repositories if prompted
4. Vercel will auto-detect Next.js - click **"Deploy"**

## Step 3: Configure Environment Variables

Before deployment completes, you need to add your environment variables:

1. In the Vercel project setup, go to **"Environment Variables"**
2. Add the following variable:

   - **Name:** `DATABASE_URL`
   - **Value:** Your Neon database connection string
     ```
     postgresql://[user]:[password]@[project].neon.tech/[database]?sslmode=require
     ```
   - **Environment:** Select all (Production, Preview, Development)

3. Click **"Save"**

## Step 4: Configure Build Settings

Vercel should auto-detect Next.js, but verify these settings:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

## Step 5: Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies
   - Run the build
   - Deploy your application

## Step 6: Run Database Migrations

After deployment, you need to run Prisma migrations:

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link your project:
   ```bash
   vercel link
   ```

4. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

5. Run migrations:
   ```bash
   npm run db:push
   ```

### Option B: Using Neon Console

1. Go to your Neon dashboard
2. Open the SQL Editor
3. Run the Prisma migration SQL manually (from `prisma/migrations/`)

### Option C: Using a one-time script

Create a migration script that runs on first deployment, or use Vercel's post-deploy hook.

## Step 7: Verify Deployment

1. Once deployment completes, Vercel will provide you with a URL like:
   `https://your-project.vercel.app`

2. Visit the URL to verify your application is working

3. Check the **"Metrics"** tab in Vercel dashboard for any errors

## Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] Database connection works (test by creating a metric)
- [ ] Environment variables are set correctly
- [ ] Database migrations are applied
- [ ] Custom domain is configured (optional)

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Database Connection Issues

- Verify `DATABASE_URL` is set correctly in Vercel
- Check Neon database is accessible (not paused)
- Ensure connection string includes `?sslmode=require`

### Environment Variables Not Working

- Make sure variables are set for the correct environment (Production/Preview/Development)
- Redeploy after adding new environment variables

## Continuous Deployment

Once connected, Vercel will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for pull requests
- Run builds automatically

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Neon Documentation](https://neon.tech/docs)

