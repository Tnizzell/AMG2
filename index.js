import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import stripeRoutes from './routes/stripe.js';
import replyRoutes from './routes/reply.js';
import ttsRoutes from './routes/tts.js';
import transcribeRoutes from './routes/transcribe.js';

dotenv.config(); // ✅ load env first

const app = express();

app.use(cors());
app.use(express.json());

app.use('/transcribe', transcribeRoutes); // ✅ move below app declaration
app.use('/reply', replyRoutes);
app.use('/subscribe', stripeRoutes);
app.use('/tts', ttsRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
