import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import stripeRoutes from './routes/stripe.js';
import replyRoutes from './routes/reply.js';
import ttsRoutes from './routes/tts.js';
import transcribeRoutes from './routes/transcribe.js';

dotenv.config();


const app = express();
app.use('/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(cors({
    origin: ['https://amg-frontend.vercel.app'], // Add your frontend here
    credentials: true
  }));
app.use(express.json());

app.use('/transcribe', transcribeRoutes);
app.use('/reply', replyRoutes);
app.use('/subscribe', stripeRoutes); // optional for checkout
app.use('/stripe', stripeRoutes);    // ✅ REQUIRED for webhook
app.use('/tts', ttsRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
