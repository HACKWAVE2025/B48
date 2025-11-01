const { GoogleGenerativeAI } = require('@google/generative-ai');
const StudySession = require('../models/StudySession');
const Message = require('../models/Message');

// Validate API key
if (!process.env.GEMINI_API_KEY) {
  console.error('[AI Summary] WARNING: GEMINI_API_KEY not found in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AISummaryService {
  async generateSessionSummary(sessionId) {
    try {
      console.log(`[AI Summary] Starting summary generation for session: ${sessionId}`);
      
      // Check if API key is available
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
      }

      // Get session details
      const session = await StudySession.findOne({ sessionId })
        .populate('createdBy', 'name')
        .populate('activeUsers', 'name');

      if (!session) {
        console.error(`[AI Summary] Session not found: ${sessionId}`);
        throw new Error('Session not found');
      }

      console.log(`[AI Summary] Session found: ${session.title}, Status: ${session.status}`);

      // Get all messages from the session
      const messages = await Message.find({ roomId: sessionId })
        .populate('userId', 'name')
        .sort({ createdAt: 1 });

      console.log(`[AI Summary] Found ${messages.length} messages for session ${sessionId}`);

      // Count files shared
      const filesShared = messages.filter(msg => 
        msg.messageType && msg.messageType !== 'text' && msg.messageType !== 'system'
      ).length;

      // Prepare conversation text for AI
      const conversationText = messages
        .filter(msg => msg.messageType === 'text' && msg.content)
        .map(msg => `${msg.userId?.name || 'User'}: ${msg.content}`)
        .join('\n');

      console.log(`[AI Summary] Conversation text length: ${conversationText.length} characters`);

      if (!conversationText || conversationText.trim().length < 50) {
        // Not enough content to generate meaningful summary
        console.log(`[AI Summary] Insufficient conversation data, using fallback summary`);
        const fallbackSummary = {
          summary: 'This session had minimal discussion. No detailed summary available.',
          keyTopics: [session.topic],
          participants: session.activeUsers?.length || 0,
          totalMessages: messages.length,
          filesShared: filesShared,
          insights: ['Session concluded with limited interaction'],
          generatedAt: new Date()
        };
        
        // Save fallback summary to session
        session.aiSummary = fallbackSummary;
        await session.save();
        console.log(`[AI Summary] Fallback summary saved for session: ${sessionId}`);
        
        return fallbackSummary;
      }

      // Create prompt for AI
      const prompt = `You are an educational assistant analyzing a study session conversation. Your task is to create a comprehensive summary focusing on WHAT WAS DISCUSSED, the concepts covered, questions asked, and learning that took place.

Session Context:
- Title: ${session.title}
- Topic: ${session.topic}
- Subject: ${session.subject}
- Duration: ${session.duration} minutes
- Number of Participants: ${session.activeUsers?.length || 0}

Complete Conversation Transcript:
${conversationText}

Based on the conversation above, please analyze and provide a JSON response with:

{
  "summary": "A detailed 4-6 sentence summary describing: (1) What the session was about, (2) Main concepts and ideas discussed by participants, (3) Key questions asked and answered, (4) Important conclusions or understanding reached. Focus on the ACTUAL discussion content, not just metadata.",
  
  "keyTopics": ["Specific topic 1 discussed", "Specific topic 2 discussed", "Concept 3 covered", ...], 
  // Extract 5-8 specific topics/concepts that were actually mentioned in the conversation
  
  "insights": [
    "Learning insight 1: What students understood or learned",
    "Key point 2: Important concept clarified during discussion",
    "Takeaway 3: Practical knowledge gained",
    "Discussion highlight 4: Interesting question or debate",
    "Conclusion 5: How the session helped participants"
  ]
  // Provide 5-7 educational insights based on what was ACTUALLY discussed
}

CRITICAL INSTRUCTIONS:
- Read the conversation transcript carefully
- Focus on CONTENT: What concepts, ideas, questions, explanations were shared
- Be specific: Mention actual topics/concepts from the conversation
- Avoid generic statements like "collaborative learning" - be precise about what was learned
- If technical concepts were discussed, mention them by name
- If examples were given, reference them
- If questions were asked, note the key questions
- Make it feel like a real summary of what happened in the chat
- Return ONLY valid JSON, no markdown formatting or extra text`;

      console.log(`[AI Summary] Sending request to Gemini AI...`);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log(`[AI Summary] Received response from Gemini AI`);

      // Parse AI response
      let aiData;
      try {
        // Extract JSON from response (remove markdown code blocks if present)
        let jsonText = text.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```\n?/g, '');
        }
        
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiData = JSON.parse(jsonMatch[0]);
        } else {
          aiData = JSON.parse(jsonText);
        }
        console.log(`[AI Summary] Successfully parsed AI response`);
      } catch (parseError) {
        console.error('[AI Summary] Failed to parse AI response:', parseError);
        console.error('[AI Summary] AI Response text:', text.substring(0, 500));
        // Fallback summary
        aiData = {
          summary: `Study session focused on ${session.topic}. Participants engaged in discussion covering multiple aspects of ${session.subject}. The conversation included ${messages.length} messages exchanged among ${session.activeUsers?.length || 0} participants over ${session.duration} minutes.`,
          keyTopics: [session.topic, session.subject],
          insights: [
            'Session facilitated collaborative learning among participants',
            'Multiple perspectives and viewpoints were shared during discussion',
            'Participants engaged actively in the study session'
          ]
        };
      }

      // Construct final summary
      const summaryData = {
        summary: aiData.summary || `Session on ${session.topic} completed successfully.`,
        keyTopics: aiData.keyTopics || [session.topic],
        participants: session.activeUsers?.length || 0,
        totalMessages: messages.length,
        filesShared: filesShared,
        insights: aiData.insights || ['Session completed with collaborative learning'],
        generatedAt: new Date()
      };

      console.log(`[AI Summary] Summary data constructed, saving to database...`);

      // Save summary to session
      session.aiSummary = summaryData;
      await session.save();

      console.log(`[AI Summary] ✓ AI summary generated and saved successfully for session: ${sessionId}`);
      console.log(`[AI Summary] Summary contains ${summaryData.keyTopics.length} topics and ${summaryData.insights.length} insights`);
      
      return summaryData;

    } catch (error) {
      console.error('[AI Summary] ✗ Error generating AI summary:', error.message);
      console.error('[AI Summary] Stack trace:', error.stack);
      
      // Return a basic summary even if AI fails
      try {
        const session = await StudySession.findOne({ sessionId })
          .populate('activeUsers', 'name');
        
        if (!session) {
          console.error('[AI Summary] Session not found in error handler');
          throw new Error('Session not found');
        }

        const messages = await Message.find({ roomId: sessionId });
        const filesShared = messages.filter(msg => 
          msg.messageType && msg.messageType !== 'text' && msg.messageType !== 'system'
        ).length;

        const fallbackSummary = {
          summary: `Study session on ${session?.topic || 'various topics'} completed with ${session?.activeUsers?.length || 0} participants. ${messages.length} messages were exchanged during the session.`,
          keyTopics: [session?.topic || 'General', session?.subject].filter(Boolean),
          participants: session?.activeUsers?.length || 0,
          totalMessages: messages.length,
          filesShared: filesShared,
          insights: [
            'Session provided collaborative learning opportunity',
            'Participants engaged in discussions',
            `Session focused on ${session?.topic || 'the topic'}`
          ],
          generatedAt: new Date()
        };

        session.aiSummary = fallbackSummary;
        await session.save();
        
        console.log(`[AI Summary] Fallback summary saved for session: ${sessionId}`);
        return fallbackSummary;
      } catch (innerError) {
        console.error('[AI Summary] Failed to create fallback summary:', innerError);
        throw error; // Throw original error
      }
    }
  }

  async getSessionSummary(sessionId) {
    try {
      console.log(`[AI Summary] Getting summary for session: ${sessionId}`);
      const session = await StudySession.findOne({ sessionId });
      
      if (!session) {
        console.error(`[AI Summary] Session not found: ${sessionId}`);
        throw new Error('Session not found');
      }

      console.log(`[AI Summary] Session status: ${session.status}`);

      // If summary already exists, return it
      if (session.aiSummary && session.aiSummary.generatedAt) {
        console.log(`[AI Summary] Returning existing summary for session: ${sessionId}`);
        return session.aiSummary;
      }

      console.log(`[AI Summary] No existing summary found for session: ${sessionId}`);

      // If session is completed but no summary, generate it
      if (session.status === 'completed') {
        console.log(`[AI Summary] Session is completed, generating summary now...`);
        return await this.generateSessionSummary(sessionId);
      }

      console.log(`[AI Summary] Session not completed yet, cannot generate summary`);
      return null;
    } catch (error) {
      console.error('[AI Summary] Error getting session summary:', error.message);
      throw error;
    }
  }
}

module.exports = new AISummaryService();
