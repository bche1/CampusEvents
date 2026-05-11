const router = require('express').Router();
const Event = require('../models/Event');



// GET single event
router.get('/:id', async (req, res) => {
  try {
    const activity = await Event.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Not found' });
    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all events with filtering (?category=) and search (?q=)
router.get('/', async (req, res) => {
  try {
    const criteria = {};
    if (req.query.category && req.query.category !== 'all')
      criteria.category = req.query.category;
    if (req.query.q)
      criteria.name = { $regex: req.query.q, $options: 'i' };
    const eventList = await Event.find(criteria).sort({ date: 1 });
    res.json(eventList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create event
router.post('/', async (req, res) => {
  try {
    const activity = new Event(req.body);
    await activity.save();
    res.status(201).json(activity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE event
router.delete('/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;