const express = require('express');
const router = express.Router();
const Feature = require('../models/Feature');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all features
router.get('/', auth, async (req, res) => {
  try {
    const features = await Feature.findAll(true);
    res.json(features);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new feature (admin only)
router.post('/', admin, async (req, res) => {
  try {
    const featureId = await Feature.create(req.body);
    const feature = await Feature.findById(featureId);
    res.status(201).json(feature);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific feature
router.get('/:id', auth, async (req, res) => {
  try {
    const feature = await Feature.findById(req.params.id);
    if (!feature) {
      return res.status(404).json({ message: 'Feature not found' });
    }
    res.json(feature);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update feature (admin only)
router.put('/:id', admin, async (req, res) => {
  try {
    const feature = await Feature.findById(req.params.id);
    if (!feature) {
      return res.status(404).json({ message: 'Feature not found' });
    }
    await feature.update(req.body);
    res.json(feature);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete feature (admin only)
router.delete('/:id', admin, async (req, res) => {
  try {
    const feature = await Feature.findById(req.params.id);
    if (!feature) {
      return res.status(404).json({ message: 'Feature not found' });
    }
    await feature.delete();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check feature access
router.get('/:key/access', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const hasAccess = await user.canAccessFeature(req.params.key);
    res.json({ hasAccess });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Record feature usage
router.post('/:key/use', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const featureKey = req.params.key;
    
    const hasAccess = await user.canAccessFeature(featureKey);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Feature access denied' });
    }

    // Update usage count
    const usage = user.featureUsage.get(featureKey) || { count: 0, lastReset: new Date() };
    usage.count += 1;
    user.featureUsage.set(featureKey, usage);
    await user.save();

    res.json({ message: 'Feature usage recorded', usage });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
