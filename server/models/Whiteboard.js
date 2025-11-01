const mongoose = require('mongoose');

const whiteboardSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  data: {
    type: [String], // Array of canvas image data URLs
    default: []
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastModified on save
whiteboardSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model('Whiteboard', whiteboardSchema);
