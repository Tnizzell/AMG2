import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { checkActiveSubscriptions } from './utils/cronCheck.js';

import stripeRoutes from './routes/stripe.js';
import replyRoutes from './routes/reply.js';
import ttsRoutes from './routes/tts.js';
import transcribeRoutes from './routes/transcribe.js';
import portalRoutes from './routes/portal.js';

dotenv.config();

const app = express();

// ✅ CORS must come BEFORE body parsers
app.use(cors({
  origin: 'https://amg-frontend.vercel.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ Stripe webhook needs raw body parsing for signature verification
app.use('/stripe/webhook', express.raw({ type: 'application/json' }));

// ✅ All other routes use JSON
app.use(express.json());

// ✅ Route mounts
app.use('/transcribe', transcribeRoutes);
app.use('/reply', replyRoutes);
app.use('/subscribe', stripeRoutes);
app.use('/tts', ttsRoutes);
app.use('/portal', portalRoutes);

setInterval(() => {
    console.log('⏱️ Running cron job at', new Date().toLocaleString());
    checkActiveSubscriptions();
  }, 5 * 60 * 1000);
  
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
