import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Initialize Supabase admin client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // use the service role key so you can write to any user's row
);

// ✅ Stripe checkout session
router.post('/', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: req.body.email, // frontend must send user email
      line_items: [{
        price: 'prod_S5dQoojI3pcQJ2', // replace with your live price ID
        quantity: 1,
      }],
      success_url: 'https://yourdomain.com/success',
      cancel_url: 'https://yourdomain.com/cancel',
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Stripe session failed' });
  }
});

// ✅ Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email;

    // ✅ Update user in Supabase to set isPremium = true
    const { error } = await supabase
      .from('users')
      .update({ isPremium: true })
      .eq('email', email);

    if (error) {
      console.error('❌ Failed to update user in Supabase:', error.message);
    } else {
      console.log('✅ User upgraded to premium:', email);
    }
  }

  res.status(200).send('Webhook received');
});

export default router;
