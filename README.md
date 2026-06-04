# EverCraft Publications

This is the unified codebase for EverCraft Publications, integrating both the Vite React frontend and Node.js Express serverless API. It is designed to be easily deployed in a single click via Vercel.

## Tech Stack
- **Frontend**: React (v19) + TypeScript + Tailwind CSS (v4) + Vite
- **Backend**: Node.js + Express + Zod + TypeScript (running as Vercel Serverless Functions)
- **Database**: MySQL (local XAMPP or Cloud MySQL like Aiven/Clever Cloud/PlanetScale)
- **Deployment**: Vercel (Frontend + Serverless Functions + Cron Jobs)

---

## Local Development Setup

### 1. Prerequisites
- **Node.js** installed (v18 or higher recommended)
- **MySQL Database** running (e.g., XAMPP, Local MySQL Server, or Cloud instance)

### 2. Database & Environment Setup
1. Create a database named `evercraft` in MySQL.
2. In the root directory, create a `.env` file and set the `DATABASE_URL` environment variable:
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/evercraft"
   
   # Optional Email (Brevo integration)
   BREVO_API_KEY="your_api_key"
   BREVO_SENDER_EMAIL="info@evercraft.in"
   BREVO_SENDER_NAME="EverCraft Publications"
   
   # Optional Cloudinary (for profile image uploads)
   VITE_CLOUDINARY_CLOUD_NAME="your_cloud_name"
   VITE_CLOUDINARY_UPLOAD_PRESET="your_upload_preset"
   ```

### 3. Run Locally
Open a terminal in the root directory and run:
```bash
npm install
npm run dev
```

This will run both the frontend dev server (port `5173`) and the backend Express API server (port `8000`) concurrently. 
- Frontend URL: http://localhost:5173
- Backend API URL: http://localhost:8000

*Note: The backend automatically initializes the MySQL database tables and seeds mock book/admin data upon the first startup.*

---

## Vercel Deployment

Deploying the unified application to Vercel requires zero complex setup:

1. Import the root repository to Vercel.
2. Vercel will automatically detect **Vite** as the framework preset.
3. Configure the following **Environment Variables** in the Vercel dashboard:
   - `DATABASE_URL` (Point to your hosted/cloud MySQL database)
   - `NODE_ENV` = `production`
   - `BREVO_API_KEY` (if using email features)
   - `VITE_CLOUDINARY_CLOUD_NAME` (if using profile photo uploads)
   - `VITE_CLOUDINARY_UPLOAD_PRESET` (if using profile photo uploads)
4. Click **Deploy**. Vercel will build the frontend assets and serve all `/api/*` requests through the serverless function (`api/index.ts`).

### Background Jobs (Vercel Cron)
The project includes a `vercel.json` configuration scheduling the abandoned cart checker job. Vercel will automatically call `/api/cron/check-abandoned-carts` hourly.