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

// ✅ Full CORS handling (Vercel + local dev)
const allowedOrigins = ['https://amg-frontend.vercel.app', 'http://localhost:3000'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ Preflight handler (OPTIONS request support)
app.options('*', cors());

// ✅ Manual header backup (in case CORS still silently fails)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://amg-frontend.vercel.app');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
    next();
  });
  

// ✅ Static model hosting
app.use('/models', express.static(path.join(__dirname, 'public/models')));

// ✅ Stripe raw body
app.use('/stripe/webhook', express.raw({ type: 'application/json' }));

// ✅ All other routes use JSON
app.use(express.json());

// ✅ Mount routes
app.use('/transcribe', transcribeRoutes);
app.use('/reply', replyRoutes);
app.use('/subscribe', stripeRoutes);
app.use('/tts', ttsRoutes);
app.use('/portal', portalRoutes);
app.use('/model', modelRoutes);

// ✅ Cron
setInterval(() => {
  console.log('⏱️ Running cron job at', new Date().toLocaleString());
  checkActiveSubscriptions();
}, 5 * 60 * 1000);

// ✅ Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
