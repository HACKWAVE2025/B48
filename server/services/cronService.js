const cron = require('node-cron');
const dailyQuestionService = require('./dailyQuestionService');
const aiSummaryService = require('./aiSummaryService');
const StudySession = require('../models/StudySession');

class CronService {
  constructor() {
    this.jobs = new Map();
  }

  /**
   * Start all cron jobs
   */
  startAllJobs() {
    this.startDailyQuestionGeneration();
    this.startSessionStatusUpdater();
    console.log('All cron jobs started successfully');
  }

  /**
   * Start daily question generation job
   * Runs every day at 12:00 AM IST
   */
  startDailyQuestionGeneration() {
    // Run at 12:00 AM every day (IST timezone)
    const job = cron.schedule('26 12 * * *', async () => {
      console.log('Starting daily question generation...');
      try {
        await dailyQuestionService.generateDailyQuestions();
        console.log('Daily questions generated successfully');
      } catch (error) {
        console.error('Error in daily question generation cron job:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    });

    this.jobs.set('dailyQuestions', job);
    job.start();

    console.log('Daily question generation cron job started (runs at 12:00 AM IST)');

    // Generate questions immediately for testing (remove in production)
    // Uncomment the line below to generate questions right now for testing
    // dailyQuestionService.generateDailyQuestions();
  }

  /**
   * Update study session statuses
   * Runs every minute to check and update session statuses
   */
  startSessionStatusUpdater() {
    // Run every minute
    const job = cron.schedule('* * * * *', async () => {
      try {
        await this.updateSessionStatuses();
      } catch (error) {
        console.error('Error in session status updater cron job:', error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('sessionStatusUpdater', job);
    job.start();

    console.log('Session status updater cron job started (runs every minute)');
  }

  /**
   * Update session statuses based on current time
   */
  async updateSessionStatuses() {
    const now = new Date();

    // Activate scheduled sessions that should start now
    const sessionsToActivate = await StudySession.find({
      status: 'scheduled'
    });

    for (const session of sessionsToActivate) {
      // Skip if session doesn't have required fields
      if (!session.startTime || !session.date) {
        console.warn(`Session ${session.sessionId} missing startTime or date, skipping...`);
        continue;
      }

      const sessionDate = new Date(session.date);
      const [hours, minutes] = session.startTime.split(':').map(Number);
      sessionDate.setHours(hours, minutes, 0, 0);

      // Activate if current time is at or past start time
      if (now >= sessionDate) {
        session.status = 'active';
        await session.save();
        console.log(`Activated session: ${session.title} (${session.sessionId})`);
      }
    }

    // Complete active sessions that have ended
    const activeSessions = await StudySession.find({
      status: 'active'
    });

    for (const session of activeSessions) {
      // Skip if session doesn't have required fields
      if (!session.startTime || !session.date || !session.duration) {
        console.warn(`Session ${session.sessionId} missing required fields, skipping...`);
        continue;
      }

      const sessionDate = new Date(session.date);
      const [startHours, startMinutes] = session.startTime.split(':').map(Number);
      sessionDate.setHours(startHours, startMinutes, 0, 0);
      
      const endDate = new Date(sessionDate.getTime() + session.duration * 60000);

      // Complete if current time is past end time
      if (now > endDate) {
        session.status = 'completed';
        session.completedAt = endDate;
        // Clear active users
        session.activeUsers = [];
        await session.save();
        console.log(`Completed session: ${session.title} (${session.sessionId})`);
        
        // Generate AI summary for the completed session (async, don't wait but handle errors)
        this.generateSummaryForSession(session.sessionId).catch(err => {
          console.error(`Failed to generate summary for ${session.sessionId}:`, err.message);
        });
      }
    }
  }

  /**
   * Generate AI summary for a session (async)
   */
  async generateSummaryForSession(sessionId) {
    try {
      console.log(`[Summary] Starting AI summary generation for session: ${sessionId}`);
      const result = await aiSummaryService.generateSessionSummary(sessionId);
      console.log(`[Summary] AI summary generated successfully for session: ${sessionId}`);
      return result;
    } catch (error) {
      console.error(`[Summary] Error generating AI summary for session ${sessionId}:`, error.message);
      console.error(`[Summary] Full error:`, error);
      throw error;
    }
  }

  /**
   * Stop all cron jobs
   */
  stopAllJobs() {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped cron job: ${name}`);
    });
    this.jobs.clear();
  }

  /**
   * Get status of all jobs
   */
  getJobsStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    });
    return status;
  }
}

module.exports = new CronService();