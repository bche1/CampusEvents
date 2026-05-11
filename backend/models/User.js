const mongoose = require('mongoose');

const UserModel = new mongoose.Schema({
  username:  { type: String, required: true, unique: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true, minlength: 8 }, 
  role:      { 
    type: String, 
    enum: ['student', 'org_host', 'admin'], 
    default: 'student' 
  },
  interests: [{ 
    type: String, 
    enum: ['academic', 'social', 'career', 'workshop'] 
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserModel);