import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkActiveSubscriptions } from './utils/cronCheck.js';

import stripeRoutes from './routes/stripe.js';
import replyRoutes from './routes/reply.js';
import ttsRoutes from './routes/tts.js';
import transcribeRoutes from './routes/transcribe.js';
import portalRoutes from './routes/portal.js';
import modelRoutes from './routes/model.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ CORS config (including x-user-id)
const corsOptions = {
  origin: ['https://amg-frontend.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight

// ✅ Serve static models
app.use('/models', express.static(path.join(__dirname, 'public/models')));

// ✅ Stripe webhook needs raw body
app.use('/stripe/webhook', express.raw({ type: 'application/json' }));

// ✅ JSON parsing for everything else
app.use(express.json());

// ✅ Mount routes
app.use('/transcribe', transcribeRoutes);
app.use('/reply', replyRoutes);
app.use('/subscribe', stripeRoutes);
app.use('/tts', ttsRoutes);
app.use('/portal', portalRoutes);
app.use('/model', modelRoutes);

// ✅ Run subscription cron every 5 min
setInterval(() => {
  console.log('⏱️ Running cron job at', new Date().toLocaleString());
  checkActiveSubscriptions();
}, 5 * 60 * 1000);

// ✅ Launch server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
