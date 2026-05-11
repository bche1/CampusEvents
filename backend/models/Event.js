const mongoose = require('mongoose');

const EventModel = new mongoose.Schema({
  name:     { type: String, required: true },
  org:      { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Relational link to the Org collection
  date:     { type: Date,   required: true },
  location: String,
  category: { type: String, enum: ['academic', 'social', 'career', 'workshop'] },
  capacity: Number,
  about:    String,

  // Used for imported events from Towson's official Localist calendar
  externalId: String,
  sourceUrl:  String
}, { timestamps: true });

module.exports = mongoose.model('Event', EventModel);
