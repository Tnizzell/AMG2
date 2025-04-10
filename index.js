import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path'; // ✅ ES module-compatible import
import { fileURLToPath } from 'url';
import { checkActiveSubscriptions } from './utils/cronCheck.js';

import stripeRoutes from './routes/stripe.js';
import replyRoutes from './routes/reply.js';
import ttsRoutes from './routes/tts.js';
import transcribeRoutes from './routes/transcribe.js';
import portalRoutes from './routes/portal.js';
import modelRoutes from './routes/model.js'; // ✅ new route

dotenv.config();

// ✅ Set up __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Serve your static models from Railway
app.use('/models', express.static(path.join(__dirname, 'public/models')));

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
app.use('/model', modelRoutes); // ✅ register model route

// ✅ Cron logic
setInterval(() => {
  console.log('⏱️ Running cron job at', new Date().toLocaleString());
  checkActiveSubscriptions();
}, 5 * 60 * 1000);

// ✅ Server start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
