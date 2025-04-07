import express from 'express';

const router = express.Router();

const generateReply = ({ prompt, mood, premium }) => {
  const lowerPrompt = prompt.toLowerCase();

  const responses = {
    normal: [
      "That's interesting, tell me more 💬",
      "Really? I love hearing your thoughts 💖",
      "You always know just what to say 😊"
    ],
    flirty: [
      "Oh, you're making me blush 😳",
      "Say that again... slower 😘",
      "You always know how to get my attention 🔥"
    ],
    tsundere: [
      "D-don’t get the wrong idea, okay? 😤",
      "It's not like I like you or anything! Baka! 🙄",
      "You’re annoying… but kinda cute I guess. 😶‍🌫️"
    ],
    yandere: [
      "You're mine. Only mine. Always. 🖤",
      "No one else can have you. Ever. 🥀",
      "If I can’t have you... no one can. 🔪"
    ]
  };

  const selectedMood = responses[mood] || responses.normal;
  const randomLine = selectedMood[Math.floor(Math.random() * selectedMood.length)];

  let reply = premium
    ? `${randomLine}`
    : `${randomLine} (Unlock Premium for more 💋)`;

  return reply;
};

router.post('/', (req, res) => {
  const { prompt, premium, worksafe, mood } = req.body;

  const nsfw = prompt.toLowerCase().includes("touch") || mood === 'yandere';

  if (nsfw && (!premium || worksafe)) {
    return res.json({ reply: '', nsfw: true });
  }

  const reply = generateReply({ prompt, mood, premium });

  res.json({ reply, nsfw: false });
});

export default router;
