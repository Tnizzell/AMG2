import express from 'express';
import Stripe from 'stripe';

const router = express.Router(); // ✅ this was missing
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ New route to redirect user to Stripe billing portal
router.post('/portal', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    // Get the customer via email
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];

    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: 'https://amg-frontend.vercel.app',
    });

    res.json({ url: portalSession.url });
  } catch (err) {
    console.error('Stripe portal error:', err);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

export default router;
