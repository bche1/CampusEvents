const mongoose = require('mongoose');

const OrgModel = new mongoose.Schema({
  name:        { type: String, required: true },
  description: String,
  category:    { type: String, enum: ['academic', 'social', 'career', 'workshop'] },
  ownerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Links back to the User model
}, { timestamps: true });

module.exports = mongoose.model('Org', OrgModel);