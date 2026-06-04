import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './config/database';
import apiRouter from './routes';
import { checkAbandonedCarts } from './utils/cartChecker';

dotenv.config();

const app = express();

// Enable CORS matching Python backend's CORSMiddleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: '*',
  allowedHeaders: '*'
}));

app.use(express.json({ limit: '50mb' })); // Support base64 image uploads

// Mount endpoints under /api for consistency across local & production environments
app.use('/api', apiRouter);

// Expose Vercel Cron endpoint for background cart abandonment checks
app.get('/api/cron/check-abandoned-carts', async (req, res) => {
  // Optional security: check header or query token (Vercel provides CRON_SECRET or triggers cron headers)
  const authHeader = req.headers['authorization'];
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("⚠️ Unauthorized cron request received.");
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    await checkAbandonedCarts();
    return res.json({ message: 'Cart abandonment check completed successfully.' });
  } catch (error: any) {
    console.error("❌ Cron error checking abandoned carts:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Run local listener only when not running on Vercel serverless
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 8000;
  initDb().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 EverCraft Node API is running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to initialize local DB:', err);
  });
}

export default app;
