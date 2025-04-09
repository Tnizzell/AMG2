import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export const checkActiveSubscriptions = async () => {
  console.log('⏰ Running subscription check at', new Date().toISOString());

  const { data: users, error } = await supabase.from('users').select('id, email, ispremium, stripe_subscription_id');

  if (error) {
    console.error('❌ Failed to fetch users:', error.message);
    return;
  }

  for (const user of users) {
    try {
      if (!user.stripe_subscription_id) continue;

      const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
      const isActive = subscription.status === 'active';

      if (isActive && !user.ispremium) {
        await supabase.from('users').update({ ispremium: true }).eq('id', user.id);
        console.log(`✅ Updated ${user.email} to premium`);
      }

      if (!isActive && user.ispremium) {
        await supabase.from('users').update({ ispremium: false }).eq('id', user.id);
        console.log(`⚠️ Downgraded ${user.email} from premium`);
      }
    } catch (err) {
      console.error(`❌ Error checking subscription for ${user.email}:`, err.message);
    }
  }
};
