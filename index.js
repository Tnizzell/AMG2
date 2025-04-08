import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import stripeRoutes from './routes/stripe.js';
import replyRoutes from './routes/reply.js';
import ttsRoutes from './routes/tts.js';
import transcribeRoutes from './routes/transcribe.js';
import portalRoutes from './routes/portal.js'; // ✅ Add this

dotenv.config();

const app = express();

// ✅ Stripe webhooks need raw body parsing for signature verification
app.use('/stripe/webhook', express.raw({ type: 'application/json' }));

// ✅ All other routes use JSON
app.use(express.json());
app.use(cors({
    origin: 'https://amg-frontend.vercel.app', // ✅ your frontend URL
    methods: ['GET', 'POST'],
    credentials: true
  }));

// ✅ Route mounts
app.use('/transcribe', transcribeRoutes);
app.use('/reply', replyRoutes);
app.use('/subscribe', stripeRoutes);
app.use('/tts', ttsRoutes);
app.use('/portal', portalRoutes); // ✅ Make sure this is mounted

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
