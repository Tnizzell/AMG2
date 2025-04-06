import express from 'express';
import multer from 'multer';
import fs from 'fs';
const router = express.Router();

// setup multer for audio file handling
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  const audioFile = req.file;

  if (!audioFile) return res.status(400).send('No audio file uploaded');

  // This is just a fake placeholder until Whisper is connected
  const fakeTranscript = 'I love you too, darling.';

  // Optional: delete temp file after use
  fs.unlink(audioFile.path, () => {});
  
  res.json({ text: fakeTranscript });
});

export default router;
