const dotenv = require("dotenv");
dotenv.config();

class VoiceService {
  constructor() {
    // Support both ElevenLabs and Gemini TTS
    this.elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    this.elevenLabsVoiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Default voice: Bella
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    
    // ElevenLabs API endpoint
    this.elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${this.elevenLabsVoiceId}`;
    
    // Gemini TTS endpoint (if available)
    this.geminiTtsUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`;
  }

  /**
   * Generate a voice summary of quiz performance
   * @param {Object} quizResults - Quiz results containing score, correctAnswers, totalQuestions, etc.
   * @param {string} userName - Name of the user
   * @returns {Promise<Buffer|string>} Audio buffer or base64 encoded audio
   */
  async generateQuizSummary(quizResults, userName = 'Student') {
    try {
      const summaryText = this.buildSummaryText(quizResults, userName);
      
      // Try ElevenLabs first if API key is available
      if (this.elevenLabsApiKey) {
        return await this.generateWithElevenLabs(summaryText);
      }
      
      // Fallback to Gemini if ElevenLabs is not available
      return await this.generateWithGemini(summaryText);
      
    } catch (error) {
      console.error("Failed to generate voice summary:", error);
      throw new Error("Voice synthesis failed");
    }
  }

  /**
   * Build the text summary from quiz results
   * @param {Object} quizResults - Quiz results
   * @param {string} userName - Name of the user
   * @returns {string} Summary text
   */
  buildSummaryText(quizResults, userName) {
    const { score, correctAnswers, totalQuestions, timeTaken, subject } = quizResults;
    
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const timeString = minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} seconds` : `${seconds} seconds`;
    
    let performanceMessage = '';
    if (score >= 90) {
      performanceMessage = 'Outstanding performance! You have excellent mastery of this subject.';
    } else if (score >= 80) {
      performanceMessage = 'Excellent work! You demonstrated strong understanding.';
    } else if (score >= 70) {
      performanceMessage = 'Great job! You have a good grasp of the concepts.';
    } else if (score >= 60) {
      performanceMessage = 'Good effort! Keep practicing to improve your understanding.';
    } else {
      performanceMessage = 'Keep working on it! Review the concepts and try again.';
    }

    const encouragement = score >= 70 
      ? 'Keep up the excellent work and continue learning!' 
      : 'Remember, every quiz is a learning opportunity. Review the explanations and try again!';

    return `Hello ${userName}! Here's your quiz performance summary.

You completed a ${subject || 'general'} quiz with ${totalQuestions} questions in ${timeString}.

Your score is ${score} percent. You answered ${correctAnswers} out of ${totalQuestions} questions correctly.

${performanceMessage}

${encouragement}

Thank you for taking the quiz, and best of luck with your studies!`;
  }

  /**
   * Generate audio using ElevenLabs API
   * @param {string} text - Text to convert to speech
   * @returns {Promise<Buffer>} Audio buffer
   */
  async generateWithElevenLabs(text) {
    try {
      const response = await fetch(this.elevenLabsUrl, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.elevenLabsApiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorData}`);
      }

      const audioBuffer = await response.arrayBuffer();
      return Buffer.from(audioBuffer);

    } catch (error) {
      console.error("ElevenLabs synthesis failed:", error);
      throw error;
    }
  }

  /**
   * Generate audio using Gemini API (fallback)
   * Note: This is a placeholder. Gemini doesn't have native TTS, 
   * so this returns the text for client-side TTS
   * @param {string} text - Text to convert to speech
   * @returns {Promise<Object>} Object with text for client-side TTS
   */
  async generateWithGemini(text) {
    // Gemini doesn't have built-in TTS, so we return structured data
    // for the client to use browser's Speech Synthesis API
    return {
      type: 'text',
      text: text,
      useClientTTS: true
    };
  }

  /**
   * Generate a detailed review with emphasis on key points
   * @param {Array} results - Detailed question results with explanations
   * @param {string} userName - Name of the user
   * @returns {Promise<Buffer|Object>} Audio buffer or TTS data
   */
  async generateDetailedReview(results, userName = 'Student') {
    try {
      const reviewText = this.buildDetailedReviewText(results, userName);
      
      if (this.elevenLabsApiKey) {
        return await this.generateWithElevenLabs(reviewText);
      }
      
      return await this.generateWithGemini(reviewText);
      
    } catch (error) {
      console.error("Failed to generate detailed review:", error);
      throw new Error("Voice synthesis failed");
    }
  }

  /**
   * Build detailed review text with key takeaways
   * @param {Array} results - Question results
   * @param {string} userName - Name of the user
   * @returns {string} Detailed review text
   */
  buildDetailedReviewText(results, userName) {
    const incorrectAnswers = results.filter(r => !r.isCorrect);
    const correctCount = results.length - incorrectAnswers.length;
    
    let text = `Hello ${userName}! Let's review your quiz performance.\n\n`;
    text += `You got ${correctCount} out of ${results.length} questions correct.\n\n`;
    
    if (incorrectAnswers.length > 0) {
      text += `Let's focus on the questions you missed:\n\n`;
      
      incorrectAnswers.slice(0, 3).forEach((result, index) => {
        text += `Question ${index + 1}: ${result.question}\n`;
        text += `You answered: ${result.userAnswer}.\n`;
        text += `The correct answer is: ${result.correctAnswer}.\n`;
        text += `${result.explanation}\n\n`;
      });
    } else {
      text += `Excellent! You answered all questions correctly. `;
      text += `Your understanding of the material is outstanding.\n\n`;
    }
    
    text += `Keep practicing and continue your learning journey!`;
    
    return text;
  }

  /**
   * Check if voice service is available
   * @returns {boolean} True if voice synthesis is available
   */
  isAvailable() {
    return !!(this.elevenLabsApiKey || this.geminiApiKey);
  }

  /**
   * Get available voice service type
   * @returns {string} Service type: 'elevenlabs', 'gemini', or 'none'
   */
  getServiceType() {
    if (this.elevenLabsApiKey) return 'elevenlabs';
    if (this.geminiApiKey) return 'gemini';
    return 'none';
  }
}

module.exports = new VoiceService();
