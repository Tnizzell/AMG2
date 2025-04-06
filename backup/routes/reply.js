
import express from 'express';

const router = express.Router();

router.post('/', (req, res) => {
  const { prompt, premium, worksafe, mood } = req.body;

  let reply = `(${mood}) You said: ${prompt}`;

  const nsfw = prompt.toLowerCase().includes("touch") || mood === 'yandere';

  if (nsfw && (!premium || worksafe)) {
    return res.json({ reply: '', nsfw: true });
  }

  reply += premium ? ' 😘' : ' 😉';
  res.json({ reply, nsfw: false });
});

export default router;
