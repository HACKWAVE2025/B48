import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Clock, Users, MessageCircle, FileText, 
  Lightbulb, BookOpen, X, Loader, RefreshCw 
} from 'lucide-react';

const SessionSummaryModal = ({ session, isOpen, onClose }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getBackendUrl = () => {
    return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  };

  useEffect(() => {
    if (isOpen && session) {
      fetchSummary();
    }
  }, [isOpen, session]);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const backendUrl = getBackendUrl();

      const response = await fetch(
        `${backendUrl}/api/sessions/sessions/${session.sessionId}/summary`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (data.success) {
        setSummary(data.summary);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError('Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const backendUrl = getBackendUrl();

      const response = await fetch(
        `${backendUrl}/api/sessions/sessions/${session.sessionId}/generate-summary`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (data.success) {
        setSummary(data.summary);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error generating summary:', err);
      setError('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-900/50 to-indigo-900/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Session Summary</h2>
                <p className="text-purple-300 text-sm mt-1">{session?.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-12 h-12 text-purple-500 animate-spin mb-4" />
              <p className="text-white/60">Generating AI summary...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={generateSummary}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all flex items-center space-x-2 mx-auto"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Generate Summary</span>
              </button>
            </div>
          ) : summary ? (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-white/60 text-sm">Participants</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{summary.participants}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white/60 text-sm">Messages</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{summary.totalMessages}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span className="text-white/60 text-sm">Files</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{summary.filesShared}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-white/60 text-sm">Duration</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{session?.duration}m</p>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-center space-x-2 mb-4">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Session Overview</h3>
                </div>
                <p className="text-white/80 leading-relaxed">{summary.summary}</p>
              </div>

              {/* Key Topics */}
              {summary.keyTopics && summary.keyTopics.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Key Topics Discussed</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {summary.keyTopics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 rounded-full text-white text-sm font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              {summary.insights && summary.insights.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Key Insights & Takeaways</h3>
                  </div>
                  <div className="space-y-3">
                    {summary.insights.map((insight, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 bg-white/5 rounded-lg p-4 border border-white/10"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <p className="text-white/80 flex-1">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated At */}
              <div className="text-center pt-4 border-t border-white/10">
                <p className="text-white/40 text-sm">
                  Summary generated on {new Date(summary.generatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-purple-500/50 mx-auto mb-4" />
              <p className="text-white/60 mb-6">No summary available yet.</p>
              <button
                onClick={generateSummary}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all flex items-center space-x-2 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate AI Summary</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionSummaryModal;
