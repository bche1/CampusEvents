const mongoose = require('mongoose');

const EventModel = new mongoose.Schema({
  name:     { type: String, required: true },
  org:      { type: String, required: true },
  date:     { type: Date,   required: true },
  location: String,
  category: { type: String, enum: ['academic', 'social', 'career', 'workshop'] },
  capacity: Number,
  about:    String,
}, { timestamps: true });
a
module.exports = mongoose.model('Event', EventModel);