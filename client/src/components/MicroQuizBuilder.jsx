import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Save, Play, Volume2, VolumeX, CheckCircle, XCircle, BookOpen, Share2, Eye, Sparkles } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import BadgeNotification from './BadgeNotification';
import MicroQuizShareModal from './MicroQuizShareModal';

const MicroQuizBuilder = () => {
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  // Builder state
  const [mode, setMode] = useState('list'); // 'list', 'create', 'take', 'results'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('math');
  const [difficulty, setDifficulty] = useState('medium');
  const [isPublic, setIsPublic] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  // Quiz taking state
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes for micro-quiz
  const [quizStartTime, setQuizStartTime] = useState(null);

  // Results state
  const [results, setResults] = useState(null);
  const [showExplanations, setShowExplanations] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [voiceServiceType, setVoiceServiceType] = useState('none');
  const [newBadges, setNewBadges] = useState([]);

  // List state
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedQuizForShare, setSelectedQuizForShare] = useState(null);

  // Voice state for explanations
  const [playingExplanationIndex, setPlayingExplanationIndex] = useState(null);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  // Student type and custom subject
  const [studentType, setStudentType] = useState('school'); // 'school' or 'college'
  const [customSubject, setCustomSubject] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Subject lists based on role
  const schoolSubjects = [
    { value: 'math', label: 'Mathematics', icon: '🔢' },
    { value: 'science', label: 'Science', icon: '🔬' },
    { value: 'english', label: 'English', icon: '📚' },
    { value: 'hindi', label: 'Hindi', icon: '🇮🇳' },
    { value: 'social_studies', label: 'Social Studies', icon: '🌍' },
    { value: 'art', label: 'Art', icon: '🎨' },
    { value: 'music', label: 'Music', icon: '🎵' },
    { value: 'computer_science', label: 'Computer Science', icon: '💻' }
  ];

  const collegeSubjects = [
    { value: 'engineering', label: 'Engineering', icon: '⚙️' },
    { value: 'commerce', label: 'Commerce', icon: '💼' },
    { value: 'humanities', label: 'Humanities', icon: '📖' },
    { value: 'life_sciences', label: 'Life Sciences', icon: '🧬' },
    { value: 'business', label: 'Business', icon: '📊' },
    { value: 'law', label: 'Law', icon: '⚖️' },
    { value: 'it', label: 'IT', icon: '💻' },
    { value: 'data_science', label: 'Data Science', icon: '📈' },
    { value: 'research_skills', label: 'Research Skills', icon: '�' },
    { value: 'languages', label: 'Languages', icon: '🗣️' }
  ];

  const researcherSubjects = [
    { value: 'artificial_intelligence', label: 'Artificial Intelligence', icon: '🤖' },
    { value: 'data_science', label: 'Data Science', icon: '📊' },
    { value: 'educational_technology', label: 'Educational Technology', icon: '🎓' },
    { value: 'policy_research', label: 'Policy Research', icon: '📋' },
    { value: 'machine_learning', label: 'Machine Learning', icon: '🧠' },
    { value: 'biotechnology', label: 'Biotechnology', icon: '🧬' },
    { value: 'environmental_science', label: 'Environmental Science', icon: '�' },
    { value: 'social_research', label: 'Social Research', icon: '👥' },
    { value: 'medical_research', label: 'Medical Research', icon: '⚕️' },
    { value: 'quantum_computing', label: 'Quantum Computing', icon: '⚛️' }
  ];

  // Get subjects based on user role
  const getSubjects = () => {
    if (user?.role === 'researcher') {
      return researcherSubjects;
    } else if (user?.role === 'student') {
      return studentType === 'school' ? schoolSubjects : collegeSubjects;
    }
    return schoolSubjects; // default
  };

  const subjects = getSubjects();

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'hard', label: 'Hard', color: 'red' }
  ];

  useEffect(() => {
    checkVoiceServiceStatus();
    if (mode === 'list') {
      fetchQuizzes();
    }
  }, [mode]);

  useEffect(() => {
    let timer;
    if (mode === 'take' && quizStartTime && !results) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, quizStartTime, results]);

  // Auto-play explanations when results are available
  useEffect(() => {
    if (results && !hasAutoPlayed && autoPlayEnabled) {
      autoPlayExplanations(results);
    }
  }, [results, hasAutoPlayed, autoPlayEnabled]);

  // Cleanup speech synthesis on mode change or unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      setPlayingExplanationIndex(null);
    };
  }, [mode]);

  const checkVoiceServiceStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/micro-quiz/voice/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setVoiceEnabled(data.available);
        setVoiceServiceType(data.serviceType);
      }
    } catch (error) {
      console.error('Error checking voice service:', error);
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const [myResponse, availableResponse] = await Promise.all([
        fetch(`${API_URL}/api/micro-quiz/my-quizzes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/micro-quiz/available`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const myData = await myResponse.json();
      const availableData = await availableResponse.json();

      if (myData.success) setMyQuizzes(myData.microQuizzes);
      if (availableData.success) setAvailableQuizzes(availableData.microQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestionsWithAI = async () => {
    if (!title.trim()) {
      alert('Please enter a quiz title first');
      return;
    }

    setGeneratingQuestions(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/quiz/generate-custom`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject,
          difficulty,
          questionCount
        })
      });

      const data = await response.json();
      
      if (data.success && data.questions && data.questions.length > 0) {
        // Transform the questions to match MicroQuiz format
        const formattedQuestions = data.questions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.answer,
          explanation: '' // Will be generated during quiz submission
        }));
        setQuestions(formattedQuestions);
        alert(`${formattedQuestions.length} questions generated successfully!`);
      } else {
        alert('Failed to generate questions. Please try again.');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions. Please try again.');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const regenerateQuestion = async (index) => {
    setGeneratingQuestions(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/quiz/generate-custom`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject,
          difficulty,
          questionCount: 1
        })
      });

      const data = await response.json();
      
      if (data.success && data.questions && data.questions.length > 0) {
        const updated = [...questions];
        updated[index] = {
          question: data.questions[0].question,
          options: data.questions[0].options,
          correctAnswer: data.questions[0].answer,
          explanation: ''
        };
        setQuestions(updated);
      }
    } catch (error) {
      console.error('Error regenerating question:', error);
      alert('Failed to regenerate question');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const removeQuestion = (index) => {
    if (questions.length > 5) {
      setQuestions(questions.filter((_, i) => i !== index));
    } else {
      alert('Micro-quiz must have at least 5 questions');
    }
  };

  const validateQuiz = () => {
    if (!title.trim()) {
      alert('Please enter a quiz title');
      return false;
    }

    if (questions.length === 0) {
      alert('Please generate questions using AI before saving');
      return false;
    }

    if (questions.length < 5 || questions.length > 10) {
      alert('Micro-quiz must have between 5 and 10 questions');
      return false;
    }

    return true;
  };

  const handleSaveQuiz = async () => {
    if (!validateQuiz()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/micro-quiz/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          subject,
          difficulty,
          questions,
          isPublic
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Micro-quiz created successfully!');
        resetBuilder();
        setMode('list');
      } else {
        alert(data.message || 'Failed to create micro-quiz');
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeQuiz = async (quizId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/micro-quiz/${quizId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentQuiz(data.microQuiz);
        setUserAnswers(new Array(data.microQuiz.questions.length).fill(null));
        setCurrentQuestionIndex(0);
        setTimeLeft(300);
        setQuizStartTime(Date.now());
        setResults(null);
        setHasAutoPlayed(false); // Reset auto-play flag for new quiz
        setMode('take');
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      alert('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    const updated = [...userAnswers];
    updated[currentQuestionIndex] = answer;
    setUserAnswers(updated);
  };

  const handleSubmitQuiz = async (timeUp = false) => {
    if (!currentQuiz) return;

    const timeTaken = Math.floor((Date.now() - quizStartTime) / 1000);

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/micro-quiz/${currentQuiz._id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers: userAnswers,
          timeTaken
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data);
        if (data.newBadges && data.newBadges.length > 0) {
          setNewBadges(data.newBadges);
        }
        
        // Generate voice summary if available
        if (voiceEnabled) {
          generateVoiceSummary(data);
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const generateVoiceSummary = async (resultsData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/micro-quiz/${currentQuiz._id}/voice-summary`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          score: resultsData.score,
          correctAnswers: resultsData.correctAnswers,
          totalQuestions: resultsData.totalQuestions,
          timeTaken: resultsData.timeTaken,
          subject: currentQuiz.subject
        })
      });

      if (voiceServiceType === 'elevenlabs') {
        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      } else {
        const data = await response.json();
        if (data.useClientTTS && data.text) {
          playClientTTS(data.text);
        }
      }
    } catch (error) {
      console.error('Error generating voice summary:', error);
    }
  };

  const playClientTTS = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
      setIsPlayingVoice(true);
      utterance.onend = () => setIsPlayingVoice(false);
    }
  };

  // Voice transcription for individual explanations
  const playExplanation = (explanation, index) => {
    // Stop any currently playing explanation
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // If clicking the same explanation, stop it
    if (playingExplanationIndex === index) {
      setPlayingExplanationIndex(null);
      return;
    }

    // Play the new explanation
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(explanation);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      setPlayingExplanationIndex(index);
      
      utterance.onend = () => {
        setPlayingExplanationIndex(null);
      };
      
      utterance.onerror = () => {
        setPlayingExplanationIndex(null);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopAllSpeech = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setPlayingExplanationIndex(null);
    }
  };

  // Auto-play explanations sequentially after quiz completion
  const autoPlayExplanations = (resultsData) => {
    if (!autoPlayEnabled || !resultsData || !resultsData.results) return;

    let currentIndex = 0;
    const explanations = resultsData.results.filter(r => r.explanation);
    
    const playNext = () => {
      if (currentIndex >= explanations.length) {
        setPlayingExplanationIndex(null);
        setHasAutoPlayed(true);
        return;
      }

      const result = explanations[currentIndex];
      const originalIndex = resultsData.results.findIndex(r => r.question === result.question);
      
      // Build explanation text with context
      let textToSpeak = `Question ${currentIndex + 1}. `;
      textToSpeak += `${result.question}. `;
      
      if (result.isCorrect) {
        textToSpeak += `You answered correctly. `;
      } else {
        textToSpeak += `You answered ${result.userAnswer}, but the correct answer is ${result.correctAnswer}. `;
      }
      
      textToSpeak += `Explanation: ${result.explanation}`;

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 1;

        setPlayingExplanationIndex(originalIndex);

        utterance.onend = () => {
          currentIndex++;
          setTimeout(() => playNext(), 500); // Small pause between explanations
        };

        utterance.onerror = () => {
          currentIndex++;
          playNext();
        };

        window.speechSynthesis.speak(utterance);
      } else {
        currentIndex++;
        playNext();
      }
    };

    // Start playing after a short delay
    setTimeout(() => playNext(), 1000);
  };

  const toggleVoicePlayback = () => {
    if (voiceServiceType === 'elevenlabs' && audioUrl) {
      const audio = new Audio(audioUrl);
      if (isPlayingVoice) {
        audio.pause();
        setIsPlayingVoice(false);
      } else {
        audio.play();
        setIsPlayingVoice(true);
        audio.onended = () => setIsPlayingVoice(false);
      }
    } else if (voiceServiceType === 'gemini') {
      if ('speechSynthesis' in window) {
        if (isPlayingVoice) {
          window.speechSynthesis.cancel();
          setIsPlayingVoice(false);
        }
      }
    }
  };

  const resetBuilder = () => {
    setTitle('');
    setDescription('');
    setSubject('math');
    setDifficulty('medium');
    setIsPublic(false);
    setQuestionCount(5);
    setQuestions([]);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleShareQuiz = (quiz) => {
    setSelectedQuizForShare(quiz);
    setShowShareModal(true);
  };

  const handleCloseShareModal = (shouldRefresh) => {
    setShowShareModal(false);
    setSelectedQuizForShare(null);
    if (shouldRefresh) {
      fetchQuizzes();
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // List View
  if (mode === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8FFD7] to-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-[#3E5F44] flex items-center gap-3">
              <BookOpen className="text-[#5E936C]" size={40} />
              Micro-Quiz Builder
            </h1>
            <button
              onClick={() => setMode('create')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:from-[#4a7554] hover:to-[#7fc281] text-white rounded-lg transition-all"
            >
              <Plus size={20} />
              Create New Quiz
            </button>
          </div>

          {/* My Quizzes */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#3E5F44] mb-4">My Quizzes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myQuizzes.map(quiz => (
                <div key={quiz._id} className="bg-white rounded-lg p-6 border border-[#93DA97]/30 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-[#3E5F44]">{quiz.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {quiz.difficulty}
                    </span>
                  </div>
                  <p className="text-[#557063] text-sm mb-3">{quiz.description}</p>
                  <div className="flex items-center gap-4 text-sm text-[#557063] mb-4">
                    <span>{subjects.find(s => s.value === quiz.subject)?.icon} {quiz.subject}</span>
                    <span>📝 {quiz.questions.length} questions</span>
                    <span>👥 {quiz.totalAttempts} attempts</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTakeQuiz(quiz._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:from-[#4a7554] hover:to-[#7fc281] text-white rounded-lg transition-all"
                    >
                      <Play size={16} />
                      Take Quiz
                    </button>
                    <button
                      onClick={() => handleShareQuiz(quiz)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      title="Share quiz"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Quizzes */}
          <div>
            <h2 className="text-2xl font-bold text-[#3E5F44] mb-4">Available Quizzes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableQuizzes.filter(q => q.createdBy._id !== user._id).map(quiz => (
                <div key={quiz._id} className="bg-white rounded-lg p-6 border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-[#3E5F44]">{quiz.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {quiz.difficulty}
                    </span>
                  </div>
                  <p className="text-[#557063] text-sm mb-2">By: {quiz.createdBy.name}</p>
                  <p className="text-[#557063] text-sm mb-3">{quiz.description}</p>
                  <div className="flex items-center gap-4 text-sm text-[#557063] mb-4">
                    <span>{subjects.find(s => s.value === quiz.subject)?.icon} {quiz.subject}</span>
                    <span>📝 {quiz.questions.length} questions</span>
                  </div>
                  <button
                    onClick={() => handleTakeQuiz(quiz._id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Play size={16} />
                    Take Quiz
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && selectedQuizForShare && (
          <MicroQuizShareModal
            quiz={selectedQuizForShare}
            onClose={handleCloseShareModal}
          />
        )}
      </div>
    );
  }

  // Create View
  if (mode === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8FFD7] to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-[#3E5F44]">Create Micro-Quiz</h1>
            <button
              onClick={() => {
                resetBuilder();
                setMode('list');
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#3E5F44] rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="bg-white backdrop-blur-sm rounded-lg p-8 border border-[#93DA97]/30 shadow-md">
            {/* Quiz Details */}
            <div className="mb-6">
              <label className="block text-[#3E5F44] font-semibold mb-2">Quiz Title*</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-[#E8FFD7]/30 text-[#3E5F44] rounded-lg border border-[#93DA97]/50 focus:border-[#5E936C] focus:outline-none"
                placeholder="Enter quiz title"
              />
            </div>

            <div className="mb-6">
              <label className="block text-[#3E5F44] font-semibold mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-[#E8FFD7]/30 text-[#3E5F44] rounded-lg border border-[#93DA97]/50 focus:border-[#5E936C] focus:outline-none"
                placeholder="Enter quiz description"
                rows="3"
              />
            </div>

            {/* Student Type Selection - Only for students */}
            {user?.role === 'student' && (
              <div className="mb-6">
                <label className="block text-[#3E5F44] font-semibold mb-2">Student Type*</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStudentType('school')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                      studentType === 'school'
                        ? 'bg-[#93DA97]/40 border-[#5E936C] text-[#3E5F44] shadow-lg'
                        : 'bg-white border-[#93DA97]/50 text-[#557063] hover:border-[#5E936C]'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🎒</div>
                      <div className="font-semibold">School Student</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentType('college')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                      studentType === 'college'
                        ? 'bg-[#93DA97]/40 border-[#5E936C] text-[#3E5F44] shadow-lg'
                        : 'bg-white border-[#93DA97]/50 text-[#557063] hover:border-[#5E936C]'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🎓</div>
                      <div className="font-semibold">College Student</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[#3E5F44] font-semibold mb-2">Subject*</label>
                <select
                  value={subject}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setShowCustomInput(true);
                      setSubject('');
                    } else {
                      setShowCustomInput(false);
                      setSubject(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2 bg-[#E8FFD7]/30 text-[#3E5F44] rounded-lg border border-[#93DA97]/50 focus:border-[#5E936C] focus:outline-none"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                  ))}
                  <option value="custom">➕ Custom Subject</option>
                </select>
              </div>

              <div>
                <label className="block text-[#3E5F44] font-semibold mb-2">Difficulty*</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 bg-[#E8FFD7]/30 text-[#3E5F44] rounded-lg border border-[#93DA97]/50 focus:border-[#5E936C] focus:outline-none"
                >
                  {difficulties.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Subject Input */}
            {showCustomInput && (
              <div className="mb-6">
                <label className="block text-[#3E5F44] font-semibold mb-2">Custom Subject*</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customSubject.trim()) {
                          setSubject(customSubject.trim());
                          setShowCustomInput(false);
                        }
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-[#E8FFD7]/30 text-[#3E5F44] rounded-lg border border-[#93DA97]/50 focus:border-[#5E936C] focus:outline-none"
                    placeholder="Enter your custom subject (e.g., Robotics, Creative Writing)"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customSubject.trim()) {
                        setSubject(customSubject.trim());
                        setShowCustomInput(false);
                      }
                    }}
                    disabled={!customSubject.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-[#5E936C] to-[#93DA97] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomSubject('');
                    }}
                    className="px-4 py-2 bg-gray-100 text-[#3E5F44] rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-[#3E5F44] font-semibold mb-2">Number of Questions*</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-4 py-2 bg-[#E8FFD7]/30 text-[#3E5F44] rounded-lg border border-[#93DA97]/50 focus:border-[#5E936C] focus:outline-none"
              >
                {[5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num} questions</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 text-[#3E5F44]">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 accent-[#5E936C]"
                />
                Make this quiz public
              </label>
            </div>

            {/* AI Generation Button */}
            {questions.length === 0 && (
              <div className="mb-6">
                <button
                  onClick={generateQuestionsWithAI}
                  disabled={generatingQuestions || !title.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:shadow-lg text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                >
                  {generatingQuestions ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating {questionCount} Questions with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Generate {questionCount} Questions with AI
                    </>
                  )}
                </button>
                <p className="text-sm text-[#557063] mt-2 text-center">
                  AI will generate {questionCount} high-quality questions based on your subject and difficulty
                </p>
              </div>
            )}

            {/* Questions Preview */}
            {questions.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-[#3E5F44]">AI Generated Questions ({questions.length})</h2>
                  <button
                    onClick={() => setQuestions([])}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    Clear All & Regenerate
                  </button>
                </div>

                {questions.map((q, qIndex) => (
                  <div key={qIndex} className="bg-[#E8FFD7]/30 rounded-lg p-6 mb-4 border border-[#93DA97]/50">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-[#3E5F44]">Question {qIndex + 1}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => regenerateQuestion(qIndex)}
                          disabled={generatingQuestions}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors disabled:opacity-50"
                          title="Regenerate this question"
                        >
                          <Sparkles size={14} />
                        </button>
                        {questions.length > 5 && (
                          <button
                            onClick={() => removeQuestion(qIndex)}
                            className="text-red-500 hover:text-red-600"
                            title="Remove this question"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-[#3E5F44] text-lg mb-3">{q.question}</p>
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, oIndex) => (
                        <div
                          key={oIndex}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                            q.correctAnswer === opt
                              ? 'bg-green-100 border border-green-400'
                              : 'bg-white border border-[#93DA97]/50'
                          }`}
                        >
                          <span className="text-[#5E936C] font-bold">{String.fromCharCode(65 + oIndex)}.</span>
                          <span className="text-[#3E5F44]">{opt}</span>
                          {q.correctAnswer === opt && (
                            <span className="ml-auto text-green-600 text-sm font-semibold">✓ Correct</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  resetBuilder();
                  setMode('list');
                }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#3E5F44] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuiz}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:shadow-lg text-white rounded-lg transition-all disabled:opacity-50"
              >
                <Save size={20} />
                {loading ? 'Saving...' : 'Save Quiz'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Take Quiz View
  if (mode === 'take' && currentQuiz && !results) {
    const question = currentQuiz.questions[currentQuestionIndex];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8FFD7] to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white backdrop-blur-sm rounded-lg p-8 border border-[#93DA97]/30 shadow-md">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-[#3E5F44]">{currentQuiz.title}</h1>
              <div className="text-2xl font-bold text-[#5E936C]">
                ⏱️ {formatTime(timeLeft)}
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-[#557063] mb-2">
                <span>Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-[#E8FFD7] rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <h2 className="text-2xl text-[#3E5F44] mb-6">{question.question}</h2>
              
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${
                      userAnswers[currentQuestionIndex] === option
                        ? 'border-[#5E936C] bg-[#93DA97]/20 text-[#3E5F44] shadow-md'
                        : 'border-[#93DA97]/50 bg-[#E8FFD7]/20 text-[#557063] hover:border-[#5E936C]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-[#5E936C]">{String.fromCharCode(65 + index)}.</span>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#3E5F44] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentQuestionIndex === currentQuiz.questions.length - 1 ? (
                <button
                  onClick={() => handleSubmitQuiz(false)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold shadow-md"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  className="px-6 py-3 bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:shadow-lg text-white rounded-lg transition-all"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results View
  if (mode === 'take' && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8FFD7] to-white p-6">
        {newBadges.length > 0 && (
          <BadgeNotification badges={newBadges} onClose={() => setNewBadges([])} />
        )}
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white backdrop-blur-sm rounded-lg p-8 border border-[#93DA97]/30 shadow-md mb-6">
            {/* Auto-Play Info Banner */}
            {autoPlayEnabled && !hasAutoPlayed && playingExplanationIndex === null && (
              <div className="mb-6 bg-blue-50 border border-blue-300 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <Volume2 size={20} />
                  <p className="text-sm">
                    🎧 Voice explanations will start automatically in a moment... 
                    <button 
                      onClick={stopAllSpeech}
                      className="ml-2 underline hover:text-blue-800 font-semibold"
                    >
                      Skip
                    </button>
                  </p>
                </div>
              </div>
            )}

            {playingExplanationIndex !== null && (
              <div className="mb-6 bg-[#93DA97]/20 border border-[#5E936C]/50 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-[#3E5F44]">
                  <Volume2 size={20} className="animate-pulse" />
                  <p className="text-sm">
                    🔊 Currently playing explanation {playingExplanationIndex + 1}...
                  </p>
                </div>
              </div>
            )}

            {/* Score Summary */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-[#3E5F44] mb-4">Quiz Complete! 🎉</h1>
              <div className={`text-6xl font-bold ${getScoreColor(results.score)} mb-4`}>
                {results.score}%
              </div>
              <p className="text-xl text-[#3E5F44] mb-2">
                {results.correctAnswers} out of {results.totalQuestions} correct
              </p>
              <p className="text-[#557063]">Time taken: {formatTime(results.timeTaken)}</p>
              
              {results.xpAwarded > 0 && (
                <div className="mt-4 inline-block px-6 py-3 bg-[#93DA97]/20 border border-[#5E936C]/50 rounded-lg">
                  <span className="text-[#3E5F44] font-semibold">+{results.xpAwarded} XP Earned!</span>
                </div>
              )}
            </div>

            {/* Voice Summary */}
            {voiceEnabled && (
              <div className="flex justify-center mb-6">
                <button
                  onClick={toggleVoicePlayback}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  {isPlayingVoice ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  {isPlayingVoice ? 'Stop' : 'Play'} Voice Summary
                </button>
              </div>
            )}

            {/* Voice and Explanation Controls */}
            <div className="flex justify-center gap-4 mb-6 flex-wrap">
              <button
                onClick={() => setShowExplanations(!showExplanations)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#3E5F44] rounded-lg transition-colors"
              >
                {showExplanations ? 'Hide' : 'Show'} Explanations
              </button>
              
              <button
                onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  autoPlayEnabled 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-gray-400 hover:bg-gray-500'
                } text-white`}
              >
                {autoPlayEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                Auto-Play {autoPlayEnabled ? 'ON' : 'OFF'}
              </button>

              {playingExplanationIndex !== null && (
                <button
                  onClick={stopAllSpeech}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors animate-pulse"
                >
                  <VolumeX size={20} />
                  Stop Voice
                </button>
              )}

              {!hasAutoPlayed && autoPlayEnabled && (
                <button
                  onClick={() => autoPlayExplanations(results)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Play size={20} />
                  Play All Explanations
                </button>
              )}
            </div>
          </div>

          {/* AI Performance Analysis */}
          {results.suggestions && (
            <div className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] backdrop-blur-sm rounded-lg p-8 border border-[#93DA97]/50 shadow-md mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white p-3 rounded-full">
                  <Sparkles className="text-[#5E936C]" size={24} />
                </div>
                <h2 className="text-3xl font-bold text-white">AI Performance Analysis</h2>
              </div>

              {/* Overall Assessment */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">📊 Overall Assessment</h3>
                <p className="text-white text-lg leading-relaxed bg-white/20 p-4 rounded-lg">
                  {results.suggestions.overallAssessment}
                </p>
              </div>

              {/* Strengths */}
              {results.suggestions.strengths && results.suggestions.strengths.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-3">💪 Your Strengths</h3>
                  <div className="space-y-2">
                    {results.suggestions.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-3 bg-green-100 p-4 rounded-lg border border-green-300">
                        <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                        <p className="text-green-800">{strength}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weak Areas */}
              {results.suggestions.weakAreas && results.suggestions.weakAreas.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-3">🎯 Areas to Focus On</h3>
                  <div className="space-y-2">
                    {results.suggestions.weakAreas.map((area, index) => (
                      <div key={index} className="flex items-start gap-3 bg-yellow-100 p-4 rounded-lg border border-yellow-300">
                        <div className="text-yellow-700 flex-shrink-0 mt-1 font-bold">{index + 1}.</div>
                        <p className="text-yellow-800">{area}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {results.suggestions.recommendations && results.suggestions.recommendations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-3">📚 Study Recommendations</h3>
                  <div className="space-y-2">
                    {results.suggestions.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 bg-blue-100 p-4 rounded-lg border border-blue-300">
                        <BookOpen className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                        <p className="text-blue-800">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {results.suggestions.nextSteps && results.suggestions.nextSteps.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">🚀 Next Steps</h3>
                  <div className="space-y-2">
                    {results.suggestions.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3 bg-white/20 p-4 rounded-lg border border-white/40">
                        <div className="bg-white text-[#5E936C] flex-shrink-0 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <p className="text-white">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detailed Results */}
          {showExplanations && (
            <div className="space-y-4 mb-6">
              {results.results.map((result, index) => (
                <div key={index} className="bg-white backdrop-blur-sm rounded-lg p-6 border border-[#93DA97]/30 shadow-md">
                  <div className="flex items-start gap-3 mb-3">
                    {result.isCorrect ? (
                      <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={24} />
                    ) : (
                      <XCircle className="text-red-500 flex-shrink-0 mt-1" size={24} />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#3E5F44] mb-2">
                        Question {index + 1}
                      </h3>
                      <p className="text-[#557063] mb-4">{result.question}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[#557063]">Your answer:</span>
                          <span className={result.isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {result.userAnswer}
                          </span>
                        </div>
                        {!result.isCorrect && (
                          <div className="flex items-center gap-2">
                            <span className="text-[#557063]">Correct answer:</span>
                            <span className="text-green-600">{result.correctAnswer}</span>
                          </div>
                        )}
                      </div>

                      {result.explanation && (
                        <div className="bg-[#E8FFD7]/50 rounded-lg p-4 border border-[#93DA97]/50">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-[#5E936C]">AI Explanation:</p>
                            <button
                              onClick={() => playExplanation(result.explanation, index)}
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                                playingExplanationIndex === index
                                  ? 'bg-red-500 hover:bg-red-600 text-white'
                                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                              }`}
                              title={playingExplanationIndex === index ? 'Stop explanation' : 'Play explanation'}
                            >
                              {playingExplanationIndex === index ? (
                                <>
                                  <VolumeX size={16} />
                                  <span className="text-xs">Stop</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 size={16} />
                                  <span className="text-xs">Listen</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-[#3E5F44]">{result.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setMode('list');
                setCurrentQuiz(null);
                setResults(null);
              }}
              className="px-6 py-3 bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:shadow-lg text-white rounded-lg transition-all"
            >
              Back to Quizzes
            </button>
            <button
              onClick={() => handleTakeQuiz(currentQuiz._id)}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MicroQuizBuilder;
