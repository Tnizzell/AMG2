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

  if (!file) {
    console.error('❌ No file uploaded');
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  console.log('✅ File uploaded:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    path: file.path,
    size: file.size
  });

  try {
    const stream = fs.createReadStream(file.path);

    const transcription = await openai.audio.transcriptions.create({
      file: stream,
      model: 'whisper-1',
      response_format: 'json'
    });

    console.log('✅ Transcription successful:', transcription.text);

    fs.unlinkSync(file.path); // cleanup
    res.json({ text: transcription.text });
  } catch (err) {
    console.error('❌ Whisper API Error:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to transcribe' });
  }
});


export default router;
