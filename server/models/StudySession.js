const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  topic: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  subject: {
    type: String,
    required: true,
    enum: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'General']
  },
  description: {
    type: String,
    default: '',
    maxlength: 300
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
    min: 15,
    max: 480 // Max 8 hours
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  activeUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  invitedUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  totalMessages: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  maxUsers: {
    type: Number,
    default: 50,
    min: 5,
    max: 100
  },
  tags: [{
    type: String,
    trim: true
  }],
  materials: [{
    name: String,
    url: String,
    type: String // 'pdf', 'link', 'video', etc.
  }],
  objectives: [{
    type: String,
    trim: true
  }],
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate end time
studySessionSchema.virtual('endTime').get(function() {
  const [hours, minutes] = this.startTime.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + this.duration;
  const endHours = Math.floor(endMinutes / 60) % 24;
  const endMins = endMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
});

// Check if session is joinable (active and not full)
studySessionSchema.virtual('isJoinable').get(function() {
  const now = new Date();
  const sessionDate = new Date(this.date);
  const [hours, minutes] = this.startTime.split(':').map(Number);
  sessionDate.setHours(hours, minutes, 0, 0);
  
  const [endHours, endMinutes] = this.endTime.split(':').map(Number);
  const endDate = new Date(sessionDate);
  endDate.setHours(endHours, endMinutes, 0, 0);
  
  return (
    this.status === 'active' &&
    now >= sessionDate &&
    now <= endDate &&
    this.activeUsers.length < this.maxUsers
  );
});

// Check if session has ended
studySessionSchema.virtual('hasEnded').get(function() {
  const now = new Date();
  const sessionDate = new Date(this.date);
  const [endHours, endMinutes] = this.endTime.split(':').map(Number);
  sessionDate.setHours(endHours, endMinutes, 0, 0);
  
  return now > sessionDate;
});

// Update the updatedAt field before saving
studySessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Set virtuals to be included in JSON
studySessionSchema.set('toJSON', { virtuals: true });
studySessionSchema.set('toObject', { virtuals: true });

// Index for efficient querying
studySessionSchema.index({ subject: 1, status: 1 });
studySessionSchema.index({ date: 1, status: 1 });
studySessionSchema.index({ createdBy: 1 });
studySessionSchema.index({ status: 1, date: 1 });

module.exports = mongoose.model('StudySession', studySessionSchema);
