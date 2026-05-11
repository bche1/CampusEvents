const mongoose = require('mongoose');

const OrgModel = new mongoose.Schema({
  name:        { type: String, required: true },
  description: String,
  category:    { type: String, enum: ['academic', 'social', 'career', 'workshop'] },
}, { timestamps: true });

module.exports = mongoose.model('Org', OrgModel);