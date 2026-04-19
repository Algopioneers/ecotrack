# EcoTrack Production Deployment Guide

Deploying a complex stack (Next.js Frontend + Express/Socket.IO Backend) requires a split-architecture approach. 

> [!WARNING] 
> **Why we can't deploy the Backend to Vercel:**
> Vercel is a Serverless environment. It terminates connections the exact millisecond an API request closes. Because EcoTrack uses **Socket.IO** for real-time waste collector tracking, deploying the backend to Vercel will instantly kill your WebSockets and map tracking. 

To achieve enterprise-grade stability, we will use a **Hybrid Deployment Strategy**:
* **Frontend:** Vercel (Unmatched speed, edge rendering, and Next.js optimization)
* **Backend:** Render or Railway (Persistent server instances needed for WebSockets)
* **Database:** Supabase or Neon (Serverless PostgreSQL)

---

## Phase 1: Preparation

1. **Commit your Codebase**
   Make sure all your EcoTrack code is committed and pushed into a single GitHub repository.
   ```bash
   git init
   git add .
   git commit -m "Production release"
   git branch -M main
   git push -u origin main
   ```

2. **Provision a PostgreSQL Database**
   * Go to [Supabase](https://supabase.com/) or [Neon.tech](https://neon.tech/).
   * Create a new Database project.
   * Copy the strict PostgreSQL connection URI they provide. It will look like: 
     `postgresql://user:password@hostname.com:5432/db_name?sslmode=require`

---

## Phase 2: Deploy the Backend (The Engine)

Since the backend runs WebSockets and Prisma, we recommend navigating to [Render.com](https://render.com) (or Railway.app):

1. **Create Web Service**: Connect your GitHub account and select your EcoTrack repository.
2. **Set the Root Directory**: In the setup screen, type `backend` as your root directory.
3. **Configure the Environment**:
   * **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   * **Start Command**: `npm start`
4. **Environment Variables**: Open your Dashboard Settings and inject:
   * `DATABASE_URL` (Your Live Supabase/Neon PostgreSQL link)
   * `JWT_SECRET` (A long random string for auth security)
   * `NODE_ENV` = `production`
5. **Deploy**: Render will spin up the server, run the database migrations natively, and give you a live URL (e.g., `https://ecotrack-api.onrender.com`).

---

## Phase 3: Deploy the Frontend (Vercel)

Now that your EcoTrack Backend is live and processing data, we bind the Next.js frontend via Vercel.

1. **Import Project**: Log into [Vercel](https://vercel.com) and click **Add New Project**.
2. **Select Repository**: Pick your GitHub EcoTrack repository. 
3. **Configure Project Settings**:
   * **Framework Preset**: Next.js (Vercel auto-detects this).
   * **Root Directory**: Click the edit button and select the `frontend` folder. *(Crucial step!)*
4. **Add Environment Variables**:
   Under the environment tabs, you MUST link the frontend to your newly live backend:
   * **Name**: `NEXT_PUBLIC_API_URL`
   * **Value**: `https://ecotrack-api.onrender.com` *(The live Render link from Phase 2)*
5. **Hit Deploy!**
   Vercel will compile your Tailwind caching, run the Next.js production builds, and allocate it to a live worldwide edge-network. 

> [!SUCCESS] 
> **Congratulations!**
> Your backend is securely crunching WebSockets and PostgreSQL schemas on Render, and your beautiful corporate React frontend is served natively on Vercel at lightning-fast speeds.
