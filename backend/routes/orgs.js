const router = require('express').Router();
const Org = require('../models/Org');

console.log("ORG ROUTE LOADED");
// GET single org
router.get('/:id', async (req, res) => {
  try {
    const org = await Org.findById(req.params.id);
    if (!org) return res.status(404).json({ error: 'Not found' });
    res.json(org);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all orgs
router.get('/', async (req, res) => {
  try {
    const orgList = await Org.find().sort({ name: 1 });
    res.json(orgList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create org
router.post('/', async (req, res) => {
  try {
    const org = new Org(req.body);
    await org.save();
    res.status(201).json(org);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE org
router.delete('/:id', async (req, res) => {
  try {
    await Org.findByIdAndDelete(req.params.id);
    res.json({ message: 'Org deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;