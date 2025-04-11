import express from 'express';
import supabase from '../supabaseClient.js'; // ✅ make sure this is also ESM

const router = express.Router();

router.get('/model-url', async (req, res) => {
    const userId = req.headers['x-user-id'];
    console.log('🔍 Incoming model fetch for user:', userId);
  
    if (!userId) {
      console.error('❌ No userId provided in header');
      return res.status(401).json({ error: 'Unauthorized - Missing x-user-id' });
    }
  
    const { data: user, error } = await supabase
      .from('users')
      .select('model_id')
      .eq('id', userId)
      .single();
  
    if (error || !user?.model_id) {
      console.error('❌ No model_id found for user:', userId);
      console.error('Supabase error:', error);
      return res.status(400).json({ error: 'Model not found for user' });
    }
  
    const modelMap = {
      'gen9_toon_idle': 'https://amg2-production.up.railway.app/models/gen9_toon_idle.glb',
      // other models...
    };
  
    const modelUrl = modelMap[user.model_id];
  
    if (!modelUrl) {
      console.error('❌ model_id not mapped to URL:', user.model_id);
      return res.status(400).json({ error: 'Model ID not mapped to file' });
    }
  
    console.log('✅ Returning model URL:', modelUrl);
    res.json({ url: modelUrl });
  });
  

export default router;
