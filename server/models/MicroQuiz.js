const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: [arrayMinMax, 'Must have exactly 4 options']
  },
  correctAnswer: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  }
});

function arrayMinMax(val) {
  return val.length === 4;
}

const microQuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['math', 'science', 'english', 'history', 'geography', 'general']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  questions: {
    type: [questionSchema],
    required: true,
    validate: [questionCountValidator, 'Must have between 5 and 10 questions']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [String],
  attempts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: Number,
    correctAnswers: Number,
    totalQuestions: Number,
    timeTaken: Number,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageScore: {
    type: Number,
    default: 0
  },
  totalAttempts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

function questionCountValidator(val) {
  return val.length >= 5 && val.length <= 10;
}

// Index for faster queries
microQuizSchema.index({ createdBy: 1, createdAt: -1 });
microQuizSchema.index({ subject: 1, difficulty: 1 });
microQuizSchema.index({ isPublic: 1 });

// Method to add an attempt and update statistics
microQuizSchema.methods.addAttempt = function(userId, score, correctAnswers, totalQuestions, timeTaken) {
  this.attempts.push({
    user: userId,
    score,
    correctAnswers,
    totalQuestions,
    timeTaken,
    completedAt: new Date()
  });
  
  this.totalAttempts = this.attempts.length;
  
  // Calculate average score
  const totalScore = this.attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  this.averageScore = Math.round(totalScore / this.totalAttempts);
  
  return this.save();
};

module.exports = mongoose.model('MicroQuiz', microQuizSchema);
