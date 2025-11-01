const mongoose = require('mongoose');

const sessionInviteSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudySession',
    required: true,
    index: true
  },
  sessionIdString: {
    type: String,
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 200
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  respondedAt: {
    type: Date
  }
});

// Compound index to prevent duplicate invites
sessionInviteSchema.index({ sessionIdString: 1, invitedUser: 1 }, { unique: true });

// Index for finding user's invites
sessionInviteSchema.index({ invitedUser: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('SessionInvite', sessionInviteSchema);
