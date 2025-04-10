// routes/model.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient'); // or however you're set up

router.get('/model-url', async (req, res) => {
  const userId = req.headers['x-user-id']; // Or decode from token if you're using auth

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { data: user, error } = await supabase
    .from('users')
    .select('model_id')
    .eq('id', userId)
    .single();

  if (error || !user?.model_id) {
    return res.status(404).json({ error: 'Model not found for user' });
  }

  // Define your internal model map (you can migrate this to Supabase Storage later)
  const modelMap = {
    'gen9_A': 'https://cdn.yourdomain.com/models/gen9_A.glb',
    'gen9_B': 'https://cdn.yourdomain.com/models/gen9_B.glb',
    'gen9_flirty_b': 'https://cdn.yourdomain.com/models/gen9_flirty_b.glb',
  };

  const modelUrl = modelMap[user.model_id];

  if (!modelUrl) {
    return res.status(400).json({ error: 'Model ID not mapped to a file' });
  }

  res.json({ url: modelUrl });
});

module.exports = router;
