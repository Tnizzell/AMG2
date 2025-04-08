import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ✅ Create Stripe checkout session
router.post('/', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: req.body.email,
      line_items: [
        {
          price: 'price_1RBS9UKzstiuyGlTE5sKFOa1',
          quantity: 1,
        },
      ],
      success_url: 'https://amg-frontend.vercel.app/success',
      cancel_url: 'https://amg-frontend.vercel.app/cancel',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Stripe session failed' });
  }
});

// ✅ Stripe webhook
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
    console.error('❌ Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email;
    const subscriptionId = session.subscription;

    const { error } = await supabase
      .from('users')
      .update({ ispremium: true, stripe_subscription_id: subscriptionId })
      .eq('email', email);

    if (error) {
      console.error('❌ Supabase update failed:', error.message);
    } else {
      console.log('✅ User upgraded to premium:', email);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    try {
      const customer = await stripe.customers.retrieve(customerId);
      const email = customer.email;

      const { error } = await supabase
        .from('users')
        .update({ ispremium: false })
        .eq('email', email);

      if (error) {
        console.error('❌ Supabase downgrade failed:', error.message);
      } else {
        console.log('✅ User downgraded after Stripe cancel:', email);
      }
    } catch (err) {
      console.error('❌ Failed to retrieve Stripe customer:', err.message);
    }
  }

  res.status(200).send('Webhook processed');
});

export default router;
