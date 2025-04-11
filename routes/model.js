import express from 'express';
import supabase from '../supabaseClient.js'; // ✅ make sure this is also ESM

const router = express.Router();

router.get('/model-url', async (req, res) => {
  const userId = req.headers['x-user-id'];

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { data: user, error } = await supabase
    .from('users')
    .select('model_id')
    .eq('id', userId)
    .single();

  if (error || !user?.model_id) {
    return res.status(404).json({ error: 'Model not found for user' });
  }

  const modelMap = {
    gen9_A: 'https://amg2-production.up.railway.app/models/gen9_toon_idle.glb',
    gen9_B: 'https://amg2-production.up.railway.app/models/gen9_B.glb',
    gen9_flirty_b: 'https://amg2-production.up.railway.app/models/gen9_flirty_b.glb',
  };

  const modelUrl = modelMap[user.model_id];

  if (!modelUrl) {
    return res.status(400).json({ error: 'Model ID not mapped to a file' });
  }

  res.json({ url: modelUrl });
});

export default router;
