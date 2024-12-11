const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all available plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await Plan.findAll(true);
    for (let plan of plans) {
      plan.features = await plan.getFeatures();
    }
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new plan (admin only)
router.post('/plans', admin, async (req, res) => {
  try {
    const planId = await Plan.create(req.body);
    const plan = await Plan.findById(planId);
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific plan
router.get('/plans/:id', async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    plan.features = await plan.getFeatures();
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update plan (admin only)
router.put('/plans/:id', admin, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    await plan.update(req.body);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete plan (admin only)
router.delete('/plans/:id', admin, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    await plan.delete();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Subscribe to a plan
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { planId } = req.body;
    const user = await User.findById(req.user.id);
    const plan = await Plan.findById(planId);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Here you would typically integrate with a payment processor
    // For now, we'll just update the subscription
    user.subscription = {
      plan: planId,
      status: 'active',
      currentPeriodEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };

    await user.save();
    res.json({ message: 'Successfully subscribed to plan', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.subscription.status = 'cancelled';
    await user.save();
    res.json({ message: 'Subscription cancelled', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
