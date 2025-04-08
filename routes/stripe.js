import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Create Stripe checkout session
router.post('/', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: req.body.email, // frontend must send email!
      line_items: [
        {
          price: 'price_1RBS9UKzstiuyGlTE5sKFOa1', // ✅ Use your PRICE id, not product id
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
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
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
      console.log('✅ Subscription completed for:', email);

      // Optional: Send email, log, or ping a Discord webhook
    }

    res.status(200).send('✅ Webhook received');
  }
);

export default router;
