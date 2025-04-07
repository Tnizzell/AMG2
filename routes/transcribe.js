import express from 'express';
import multer from 'multer';
import fs from 'fs';
import OpenAI from 'openai';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No audio file uploaded' });

  console.log("== File Info ==");
  console.log("Path:", file.path);
  console.log("MIME Type:", file.mimetype);
  console.log("Original Name:", file.originalname);
  console.log("Size:", file.size);

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(file.path),
      model: "whisper-1"
    });

    fs.unlinkSync(file.path);
    res.json({ text: transcription.text });
  } catch (err) {
    console.error('Whisper API Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to transcribe' });
  }
});




export default router;
