const express = require("express");
const MicroQuiz = require("../models/MicroQuiz");
const authenticateToken = require("../middleware/authMiddleware");
const quizService = require("../services/quizService");
const voiceService = require("../services/voiceService");
const xpService = require("../services/xpService");
const badgeService = require("../services/badgeService");

const router = express.Router();

// Create a new micro-quiz
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const { title, description, subject, difficulty, questions, isPublic, tags } = req.body;

    // Validate questions
    if (!questions || questions.length < 5 || questions.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Micro-quiz must have between 5 and 10 questions"
      });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.options || q.options.length !== 4 || !q.correctAnswer) {
        return res.status(400).json({
          success: false,
          message: `Invalid question at index ${i}. Each question must have a question text, 4 options, and a correct answer.`
        });
      }
    }

    const microQuiz = new MicroQuiz({
      title,
      description,
      createdBy: req.user.userId,
      subject,
      difficulty,
      questions,
      isPublic: isPublic || false,
      tags: tags || []
    });

    await microQuiz.save();

    res.json({
      success: true,
      microQuiz,
      message: "Micro-quiz created successfully"
    });

  } catch (error) {
    console.error("Error creating micro-quiz:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create micro-quiz",
      error: error.message
    });
  }
});

// Get all micro-quizzes created by the user
router.get("/my-quizzes", authenticateToken, async (req, res) => {
  try {
    const microQuizzes = await MicroQuiz.find({ createdBy: req.user.userId })
      .sort({ createdAt: -1 })
      .select('-questions.correctAnswer -questions.explanation'); // Hide answers

    res.json({
      success: true,
      microQuizzes
    });

  } catch (error) {
    console.error("Error fetching micro-quizzes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch micro-quizzes",
      error: error.message
    });
  }
});

// Get public micro-quizzes or shared with user
router.get("/available", authenticateToken, async (req, res) => {
  try {
    const { subject, difficulty } = req.query;
    
    const query = {
      $or: [
        { isPublic: true },
        { sharedWith: req.user.userId },
        { createdBy: req.user.userId }
      ]
    };

    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;

    const microQuizzes = await MicroQuiz.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name')
      .select('-questions.correctAnswer -questions.explanation'); // Hide answers

    res.json({
      success: true,
      microQuizzes
    });

  } catch (error) {
    console.error("Error fetching available micro-quizzes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch micro-quizzes",
      error: error.message
    });
  }
});

// Get a specific micro-quiz for taking
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const microQuiz = await MicroQuiz.findById(req.params.id)
      .populate('createdBy', 'name')
      .select('-questions.correctAnswer -questions.explanation'); // Hide answers and explanations

    if (!microQuiz) {
      return res.status(404).json({
        success: false,
        message: "Micro-quiz not found"
      });
    }

    // Check if user has access
    const hasAccess = microQuiz.isPublic || 
                     microQuiz.createdBy._id.toString() === req.user.userId ||
                     microQuiz.sharedWith.some(id => id.toString() === req.user.userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this micro-quiz"
      });
    }

    res.json({
      success: true,
      microQuiz
    });

  } catch (error) {
    console.error("Error fetching micro-quiz:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch micro-quiz",
      error: error.message
    });
  }
});

// Submit micro-quiz answers and get AI feedback
router.post("/:id/submit", authenticateToken, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Invalid answers format"
      });
    }

    const microQuiz = await MicroQuiz.findById(req.params.id);
    
    if (!microQuiz) {
      return res.status(404).json({
        success: false,
        message: "Micro-quiz not found"
      });
    }

    // Calculate results
    let correctAnswers = 0;
    const results = [];

    for (let i = 0; i < microQuiz.questions.length; i++) {
      const question = microQuiz.questions[i];
      const userAnswer = answers[i];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) correctAnswers++;

      results.push({
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer: userAnswer || 'Not answered',
        isCorrect
      });
    }

    const score = Math.round((correctAnswers / microQuiz.questions.length) * 100);

    // Generate AI explanations for each answer
    const resultsWithExplanations = await quizService.generateBatchExplanations(
      results,
      microQuiz.subject
    );

    // Generate personalized performance suggestions
    const suggestions = await quizService.generatePerformanceSuggestions(
      resultsWithExplanations,
      microQuiz.subject,
      score
    );

    // Update micro-quiz statistics
    await microQuiz.addAttempt(
      req.user.userId,
      score,
      correctAnswers,
      microQuiz.questions.length,
      timeTaken || 0
    );

    // Award XP
    const xpResult = await xpService.awardQuizXP(
      req.user.userId,
      score,
      microQuiz.questions.length
    );

    // Check for new badges
    const newBadges = await badgeService.checkAndAwardBadges(req.user.userId);

    res.json({
      success: true,
      score,
      correctAnswers,
      totalQuestions: microQuiz.questions.length,
      results: resultsWithExplanations,
      suggestions,
      xpAwarded: xpResult.xpAwarded || 0,
      levelInfo: xpResult.levelInfo,
      leveledUp: xpResult.leveledUp || false,
      newBadges: newBadges || [],
      timeTaken
    });

  } catch (error) {
    console.error("Error submitting micro-quiz:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit micro-quiz",
      error: error.message
    });
  }
});

// Generate voice summary for quiz results
router.post("/:id/voice-summary", authenticateToken, async (req, res) => {
  try {
    const { score, correctAnswers, totalQuestions, timeTaken, subject } = req.body;
    const User = require("../models/User");
    
    const user = await User.findById(req.user.userId);
    const userName = user?.name || 'Student';

    const quizResults = {
      score,
      correctAnswers,
      totalQuestions,
      timeTaken,
      subject
    };

    const audioData = await voiceService.generateQuizSummary(quizResults, userName);

    // If using ElevenLabs, send audio buffer
    if (Buffer.isBuffer(audioData)) {
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioData.length
      });
      res.send(audioData);
    } else {
      // If using client-side TTS, send text
      res.json({
        success: true,
        ...audioData
      });
    }

  } catch (error) {
    console.error("Error generating voice summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate voice summary",
      error: error.message
    });
  }
});

// Generate detailed voice review
router.post("/:id/voice-review", authenticateToken, async (req, res) => {
  try {
    const { results } = req.body;
    const User = require("../models/User");
    
    const user = await User.findById(req.user.userId);
    const userName = user?.name || 'Student';

    const audioData = await voiceService.generateDetailedReview(results, userName);

    if (Buffer.isBuffer(audioData)) {
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioData.length
      });
      res.send(audioData);
    } else {
      res.json({
        success: true,
        ...audioData
      });
    }

  } catch (error) {
    console.error("Error generating voice review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate voice review",
      error: error.message
    });
  }
});

// Share micro-quiz with specific users
router.post("/:id/share", authenticateToken, async (req, res) => {
  try {
    const { userIds } = req.body;

    const microQuiz = await MicroQuiz.findById(req.params.id);

    if (!microQuiz) {
      return res.status(404).json({
        success: false,
        message: "Micro-quiz not found"
      });
    }

    // Check if user is the creator
    if (microQuiz.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can share this micro-quiz"
      });
    }

    // Add users to sharedWith array (avoid duplicates)
    const newSharedUsers = userIds.filter(id => 
      !microQuiz.sharedWith.some(existingId => existingId.toString() === id)
    );

    microQuiz.sharedWith.push(...newSharedUsers);
    await microQuiz.save();

    res.json({
      success: true,
      message: "Micro-quiz shared successfully",
      sharedWith: microQuiz.sharedWith
    });

  } catch (error) {
    console.error("Error sharing micro-quiz:", error);
    res.status(500).json({
      success: false,
      message: "Failed to share micro-quiz",
      error: error.message
    });
  }
});

// Delete a micro-quiz
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const microQuiz = await MicroQuiz.findById(req.params.id);

    if (!microQuiz) {
      return res.status(404).json({
        success: false,
        message: "Micro-quiz not found"
      });
    }

    // Check if user is the creator
    if (microQuiz.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can delete this micro-quiz"
      });
    }

    await MicroQuiz.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Micro-quiz deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting micro-quiz:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete micro-quiz",
      error: error.message
    });
  }
});

// Get voice service status
router.get("/voice/status", authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      available: voiceService.isAvailable(),
      serviceType: voiceService.getServiceType()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check voice service status"
    });
  }
});

module.exports = router;
