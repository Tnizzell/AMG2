import 'dotenv/config';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function syncSubscriptions() {
  console.log(`[${new Date().toISOString()}] Checking subscriptions...`);

  const { data: users, error } = await supabase
    .from('users')
    .select('email, ispremium, stripe_subscription_id');

  if (error) {
    console.error('Failed to fetch users:', error.message);
    return;
  }

  for (const user of users) {
    if (!user.stripe_subscription_id || !user.email) continue;

    try {
      const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
      const isActive = subscription.status === 'active' || subscription.status === 'trialing';

      if (isActive && !user.ispremium) {
        await supabase
          .from('users')
          .update({ ispremium: true })
          .eq('email', user.email);
        console.log(`✅ Upgraded ${user.email}`);
      }

      if (!isActive && user.ispremium) {
        await supabase
          .from('users')
          .update({ ispremium: false })
          .eq('email', user.email);
        console.log(`⚠️ Downgraded ${user.email}`);
      }
    } catch (err) {
      console.error(`Error checking ${user.email}:`, err.message);
    }
  }
}

syncSubscriptions();
