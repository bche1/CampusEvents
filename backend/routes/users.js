const router = require('express').Router();
const User = require('../models/User');

// POST: Register a new user
router.post('/register', async (req, res) => {
  try {
    // Check if the email or username already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: req.body.email }, { username: req.body.username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already in use' });
    }

    const user = new User(req.body);
    await user.save();
    
    // Don't send the password back to the client
    user.password = undefined; 
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST: Basic Login (Placeholder for token-based auth)
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ 
      email: req.body.email, 
      password: req.body.password 
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.password = undefined;
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Fetch a user profile (e.g., to get their interests for the personalized feed)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;