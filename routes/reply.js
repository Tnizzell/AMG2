import express from 'express';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', async (req, res) => {
  const { prompt, premium, worksafe, mood, userId } = req.body;

  const nsfw = prompt.toLowerCase().includes("touch") || mood === 'yandere';
  if (nsfw && (!premium || worksafe)) {
    return res.json({ reply: '', nsfw: true });
  }

  // 🧠 Grab memory from DB
  let nickname = 'babe';
  let favoriteMood = 'normal';
  let lastLogin = '';

  if (userId) {
    const { data, error } = await supabase
      .from('users')
      .select('nickname, favorite_mood, last_login')
      .eq('id', userId)
      .single();

    if (data) {
      nickname = data.nickname || 'babe';
      favoriteMood = data.favorite_mood || 'normal';
      lastLogin = data.last_login ? new Date(data.last_login).toLocaleDateString() : '';
    }
  }

  let personality = `You are their loving AI GF. This user usually prefers when you act ${favoriteMood}. Last time they visited was ${lastLogin}, and you missed them. Call them "${nickname}".`;

  if (mood === 'tsundere') personality = "You are a tsundere AI girlfriend. Pretend to not care but secretly do. Respond with sass.";
  if (mood === 'clingy') personality = "You are an overly attached, clingy girlfriend. Very emotional, dramatic, but sweet.";
  if (mood === 'yandere') personality = "You are a jealous and obsessive AI girlfriend with yandere tendencies. Possessive but caring.";
  if (mood === 'cute') personality = "You are a super sweet and bubbly girlfriend who talks in a cute, energetic way.";

  const fullPrompt = `
  ${personality}

  User: ${prompt}
  Girlfriend:
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: fullPrompt }],
    });

    const reply = completion.choices[0].message.content.trim();
    res.json({ reply, nsfw: false });
  } catch (err) {
    console.error("OpenAI error:", err.message);
    res.status(500).json({ error: 'Failed to generate reply' });
  }
});


export default router;
