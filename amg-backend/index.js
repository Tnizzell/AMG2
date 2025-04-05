
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import stripeRoutes from './routes/stripe.js';
import replyRoutes from './routes/reply.js';
import ttsRoutes from './routes/tts.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/reply', replyRoutes);
app.use('/subscribe', stripeRoutes);
app.use('/tts', ttsRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
