import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Fetch user memory from Supabase
export const fetchUserMemory = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('nickname, favorite_mood, last_login')
    .eq('email', email)
    .single();

  if (error || !data) return null;

  return data;
};

// Generate a memory-enhanced system prompt
export const generateMemoryPrompt = ({ nickname, favorite_mood, last_login }) => {
  return `You are their loving AI girlfriend. This user usually prefers when you act ${favorite_mood}. Last time they visited was ${last_login}, and you missed them. Call them "${nickname}".`;
};
