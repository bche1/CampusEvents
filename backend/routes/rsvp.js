const router = require('express').Router();
const Rsvp   = require('../models/Rsvp');

console.log("RSVP ROUTE LOADED");
// GET all RSVPs for an event
router.get('/:eventId', async (req, res) => {
  try {
    const attendees = await Rsvp.find({ eventId: req.params.eventId });
    res.json(attendees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create RSVP
router.post('/', async (req, res) => {
  try {
    const current = await Rsvp.findOne({
      eventId: req.body.eventId,
      userId:  req.body.userId
    });
    if (current) return res.status(400).json({ error: 'Already registered' });

    const rsvp = new Rsvp(req.body);
    await rsvp.save();
    res.status(201).json(rsvp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE remove RSVP
router.delete('/', async (req, res) => {
  try {
    await Rsvp.findOneAndDelete({
      eventId: req.body.eventId,
      userId:  req.body.userId
    });
    res.json({ message: 'Registration removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;