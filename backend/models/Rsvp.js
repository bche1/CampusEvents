const mongoose = require('mongoose');

const RsvpModel = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
}, { timestamps: true });

module.exports = mongoose.model('Rsvp', RsvpModel);