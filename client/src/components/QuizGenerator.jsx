import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Brain, Sparkles, Trophy, BookOpen, Zap, Target, Clock, CheckCircle, XCircle, Users, Plus } from 'lucide-react';
import BadgeNotification from './BadgeNotification';
import CreateQuizRoomModal from './CreateQuizRoomModal';
import JoinQuizRoomModal from './JoinQuizRoomModal';
import MultiplayerQuizRoom from './MultiplayerQuizRoom';

const QuizGenerator = () => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizPreferences, setQuizPreferences] = useState({
    subject: '',
    difficulty: ''
    // Removed classLevel - it will be taken from user model
  });
  
  // Multi-question quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes = 600 seconds
  const [quizStarted, setQuizStarted] = useState(false);
  const [finalResults, setFinalResults] = useState(null);
  const [newBadges, setNewBadges] = useState([]);

  // New multiplayer state
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [searchParams] = useSearchParams();
  const [studentType, setStudentType] = useState('school');
  const [customSubject, setCustomSubject] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  // Role-based subject arrays
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
    { value: 'business', label: 'Business Studies', icon: '📊' },
    { value: 'law', label: 'Law', icon: '⚖️' },
    { value: 'it', label: 'Information Technology', icon: '�' },
    { value: 'data_science', label: 'Data Science', icon: '📈' },
    { value: 'research_skills', label: 'Research Skills', icon: '🔍' },
    { value: 'languages', label: 'Languages', icon: '🗣️' }
  ];

  const researcherSubjects = [
    { value: 'ai', label: 'Artificial Intelligence', icon: '🤖' },
    { value: 'data_science', label: 'Data Science', icon: '📊' },
    { value: 'educational_tech', label: 'Educational Technology', icon: '💡' },
    { value: 'policy_research', label: 'Policy Research', icon: '📋' },
    { value: 'ml', label: 'Machine Learning', icon: '🧠' },
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

  // Timer effect
  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0 && !showResult) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up - submit quiz
            submitQuiz(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, showResult]);

  useEffect(() => {
    // Check for room join parameter in URL
    const joinRoomId = searchParams.get('join');
    if (joinRoomId && !currentRoom) {
      setShowJoinRoomModal(true);
      // You can pre-fill the room ID here if needed
    }
  }, [searchParams]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      let response;
      if (quizPreferences.subject && quizPreferences.difficulty) {
        // Send custom preferences (classLevel will be extracted from user model on backend)
        response = await fetch(`${API_URL}/api/quiz/generate-custom`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subject: quizPreferences.subject,
            difficulty: quizPreferences.difficulty,
            questionCount: 10
          })
        });
      } else {
        response = await fetch(`${API_URL}/api/quiz/generate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      const data = await response.json();
      
      if (data.success && data.questions && data.questions.length > 0) {
        // Add question numbers to each question
        const questionsWithNumbers = data.questions.map((question, index) => ({
          ...question,
          questionNumber: index + 1
        }));

        setQuiz(questionsWithNumbers);
        setCurrentQuestionIndex(0);
        setSelectedAnswer('');
        setShowResult(false);
        setShowQuizForm(false);
        setUserAnswers(new Array(questionsWithNumbers.length).fill(null));
        setTimeLeft(600); // Reset timer to 10 minutes
        setQuizStarted(true);
        setFinalResults(null);
      } else {
        console.error('Failed to generate quiz:', data.message);
        alert('Failed to generate quiz. Please try again later.');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (answer) => {
    setSelectedAnswer(answer);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1] || '');
    } else {
      // Last question - submit quiz
      submitQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1] || '');
    }
  };

  const submitQuiz = async (timeUp = false) => {
    setQuizStarted(false);
    
    // Calculate results
    let correctAnswers = 0;
    const results = quiz.map((question, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === question.answer;
      if (isCorrect) correctAnswers++;
      
      return {
        question: question.question,
        correctAnswer: question.answer,
        userAnswer: userAnswer || 'Not answered',
        isCorrect,
        options: question.options
      };
    });

    const score = Math.round((correctAnswers / quiz.length) * 100);
    const timeTaken = 600 - timeLeft;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/quiz/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          score,
          correctAnswers,
          totalQuestions: quiz.length,
          timeTaken,
          timeUp,
          results,
          subject: quiz[0]?.subject
        })
      });

      const data = await response.json();
      
      if (data.success && data.newBadges && data.newBadges.length > 0) {
        setNewBadges(data.newBadges);
      }

      // Trigger analytics refresh across tabs
      localStorage.setItem('activityCompleted', Date.now().toString());
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }

    setFinalResults({
      score,
      correctAnswers,
      totalQuestions: quiz.length,
      timeTaken,
      timeUp,
      results
    });
    
    setShowResult(true);
  };

  const resetQuiz = () => {
    setQuiz(null);
    setSelectedAnswer('');
    setShowResult(false);
    setShowQuizForm(false);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTimeLeft(600);
    setQuizStarted(false);
    setFinalResults(null);
    setQuizPreferences({
      subject: '',
      difficulty: ''
    });
  };

  const handlePreferenceChange = (key, value) => {
    setQuizPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Outstanding! 🌟';
    if (score >= 80) return 'Excellent work! 🎉';
    if (score >= 70) return 'Great job! 👏';
    if (score >= 60) return 'Good effort! 👍';
    return 'Keep practicing! 💪';
  };

  // Extract class level from user's grade for display
  const getUserClassLevel = () => {
    if (!user?.grade) return 'Not set';
    const match = user.grade.match(/(\d+)/);
    return match ? `Class ${match[1]}` : user.grade;
  };

  const handleRoomCreated = (room) => {
    setCurrentRoom(room);
    setShowCreateRoomModal(false);
  };

  const handleRoomJoined = (room) => {
    setCurrentRoom(room);
    setShowJoinRoomModal(false);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    // Reset any quiz state if needed
    resetQuiz();
  };

  // If in a multiplayer room, show the multiplayer component
  if (currentRoom) {
    return (
      <MultiplayerQuizRoom
        room={currentRoom}
        onLeave={handleLeaveRoom}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Badge Notifications */}
      {newBadges.length > 0 && (
        <BadgeNotification 
          badges={newBadges} 
          onClose={() => setNewBadges([])}
        />
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] p-4 rounded-full shadow-sm">
            <Brain className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-[#3E5F44] mb-2">
          AI Quiz Generator
        </h1>
        <p className="text-[#557063] text-lg">
          10 questions • 10 minutes • Personalized AI quizzes
        </p>
      </div>

      {/* Quiz Options */}
      {!quiz && !showQuizForm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Single Player Quiz */}
          <div className="bg-white border border-[#93DA97]/30 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#3E5F44] mb-4">Single Player</h2>
            <p className="text-[#557063] mb-6">Practice with AI-generated personalized quizzes</p>
            <button
              onClick={() => setShowQuizForm(true)}
              className="w-full bg-[#5E936C] hover:bg-[#3E5F44] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-5 h-5" />
              <span>Start Solo Quiz</span>
            </button>
          </div>

          {/* Micro Quiz Builder */}
          <div className="bg-white border border-[#93DA97]/30 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#3E5F44] mb-4">Micro-Quiz Builder</h2>
            <p className="text-[#557063] mb-6">Create custom 5-10 question quizzes with AI feedback</p>
            <button
              onClick={() => window.location.href = '/micro-quiz'}
              className="w-full bg-[#E8FFD7] hover:bg-[#93DA97]/20 border border-[#93DA97] text-[#3E5F44] font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Micro-Quiz</span>
            </button>
          </div>

          {/* Multiplayer Quiz */}
          <div className="bg-white border border-[#93DA97]/30 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#3E5F44] mb-4">Multiplayer</h2>
            <p className="text-[#557063] mb-6">Compete with friends in real-time quiz battles</p>
            <div className="space-y-3">
              <button
                onClick={() => setShowCreateRoomModal(true)}
                className="w-full bg-[#5E936C] hover:bg-[#3E5F44] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Room</span>
              </button>
              <button
                onClick={() => setShowJoinRoomModal(true)}
                className="w-full bg-[#E8FFD7] hover:bg-[#93DA97]/20 border border-[#93DA97] text-[#3E5F44] font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Users className="w-5 h-5" />
                <span>Join Room</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Display */}
      {user && !quiz && !showQuizForm && (
        <div className="bg-white border border-[#93DA97]/30 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-[#3E5F44] font-semibold mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-[#557063] text-sm">Level</p>
              <p className="text-[#3E5F44] font-bold text-lg">{user?.level || 1}</p>
            </div>
            <div className="text-center">
              <p className="text-[#557063] text-sm">Class</p>
              <p className="text-[#3E5F44] font-bold text-lg">{getUserClassLevel()}</p>
            </div>
            <div className="text-center">
              <p className="text-[#557063] text-sm">XP</p>
              <p className="text-[#3E5F44] font-bold text-lg">{user?.xp || 0}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="bg-[#E8FFD7] px-3 py-1 rounded-full text-sm text-[#3E5F44] border border-[#93DA97]/30">
              Grade: {user?.grade || 'Not set'}
            </span>
            <span className="bg-[#E8FFD7] px-3 py-1 rounded-full text-sm text-[#3E5F44] border border-[#93DA97]/30">
              Location: {user?.location || 'Not set'}
            </span>
            <span className="bg-[#E8FFD7] px-3 py-1 rounded-full text-sm text-[#3E5F44] border border-[#93DA97]/30">
              Interests: {user?.interests?.join(', ') || 'Math'}
            </span>
          </div>
        </div>
      )}

      {/* Quiz Preference Form */}
      {!quiz && !showQuizForm && (
        <div className="text-center mb-8">
          <div className="space-y-4 mb-6">
            <button
              onClick={() => setShowQuizForm(true)}
              className="bg-[#E8FFD7] hover:bg-[#93DA97]/20 border border-[#93DA97] text-[#3E5F44] font-semibold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-sm relative overflow-hidden mr-4"
            >
              <div className="relative flex items-center justify-center space-x-3">
                <BookOpen className="w-6 h-6" />
                <span>Choose Subject & Difficulty</span>
              </div>
            </button>
            
            <button
              onClick={generateQuiz}
              disabled={loading}
              className="bg-[#5E936C] hover:bg-[#3E5F44] disabled:bg-gray-400 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-sm relative overflow-hidden"
            >
              <div className="relative flex items-center justify-center space-x-3">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span>Generating 10 Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span>Quick Quiz (Auto)</span>
                    <Zap className="w-6 h-6" />
                  </>
                )}
              </div>
            </button>
          </div>
          
          {/* User Info */}
          <div className="bg-white border border-[#93DA97]/30 rounded-xl p-4 shadow-sm">
            <p className="text-[#557063] text-sm mb-2">
              Quiz will be generated based on your profile:
            </p>
            <div className="flex justify-center space-x-4 mt-2 flex-wrap gap-2">
              <span className="bg-[#E8FFD7] px-3 py-1 rounded-full text-sm text-[#3E5F44] border border-[#93DA97]/30">
                {getUserClassLevel()}
              </span>
              <span className="bg-[#E8FFD7] px-3 py-1 rounded-full text-sm text-[#3E5F44] border border-[#93DA97]/30">
                Level: {user?.level || 1}
              </span>
              <span className="bg-[#E8FFD7] px-3 py-1 rounded-full text-sm text-[#3E5F44] border border-[#93DA97]/30">
                Location: {user?.location || 'Not set'}
              </span>
              <span className="bg-[#E8FFD7] px-3 py-1 rounded-full text-sm text-[#3E5F44] border border-[#93DA97]/30">
                Interests: {user?.interests?.join(', ') || 'Math'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Custom Quiz Form - Removed Class Level Selection */}
      {showQuizForm && !quiz && (
        <div className="bg-white border border-[#93DA97]/30 rounded-3xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-[#3E5F44] mb-6 text-center">Customize Your Quiz</h2>
          
          {/* User Class Info */}
          <div className="bg-[#E8FFD7] border border-[#93DA97]/30 rounded-xl p-4 mb-6">
            <div className="text-center">
              <p className="text-[#557063] text-sm mb-2">Quiz will be generated for:</p>
              <div className="flex justify-center space-x-4 flex-wrap gap-2">
                <span className="bg-white px-4 py-2 rounded-full text-[#3E5F44] font-medium border border-[#93DA97]/30">
                  {getUserClassLevel()}
                </span>
                <span className="bg-white px-4 py-2 rounded-full text-[#3E5F44] font-medium border border-[#93DA97]/30">
                  {user?.location || 'Your location'}
                </span>
              </div>
            </div>
          </div>

          {/* Student Type Selection - Only for students */}
          {user?.role === 'student' && (
            <div className="mb-6">
              <label className="block text-[#3E5F44] text-sm font-medium mb-3">Student Type*</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStudentType('school')}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                    studentType === 'school'
                      ? 'bg-[#5E936C]/20 border-[#5E936C] text-[#3E5F44] shadow-sm'
                      : 'bg-[#E8FFD7] border-[#93DA97]/30 text-[#557063] hover:border-[#5E936C]'
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
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                    studentType === 'college'
                      ? 'bg-[#5E936C]/20 border-[#5E936C] text-[#3E5F44] shadow-sm'
                      : 'bg-[#E8FFD7] border-[#93DA97]/30 text-[#557063] hover:border-[#5E936C]'
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
          
          {/* Subject Selection */}
          <div className="mb-6">
            <label className="block text-[#3E5F44] text-sm font-medium mb-3">Select Subject</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {subjects.map((subject) => (
                <button
                  key={subject.value}
                  onClick={() => {
                    handlePreferenceChange('subject', subject.value);
                    setShowCustomInput(false);
                  }}
                  className={`p-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                    quizPreferences.subject === subject.value && !showCustomInput
                      ? 'bg-[#5E936C]/20 border-[#5E936C] text-[#3E5F44] shadow-sm'
                      : 'bg-[#E8FFD7] border-[#93DA97]/30 text-[#557063] hover:border-[#5E936C]'
                  }`}
                >
                  <div className="text-2xl mb-2">{subject.icon}</div>
                  <div className="text-sm">{subject.label}</div>
                </button>
              ))}
              {/* Custom Subject Button */}
              <button
                onClick={() => {
                  setShowCustomInput(true);
                  setQuizPreferences(prev => ({ ...prev, subject: '' }));
                }}
                className={`p-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                  showCustomInput
                    ? 'bg-[#93DA97]/20 border-[#93DA97] text-[#3E5F44] shadow-sm'
                    : 'bg-[#E8FFD7] border-[#93DA97]/30 text-[#557063] hover:border-[#93DA97]'
                }`}
              >
                <div className="text-2xl mb-2">➕</div>
                <div className="text-sm">Custom Subject</div>
              </button>
            </div>
          </div>

          {/* Custom Subject Input */}
          {showCustomInput && (
            <div className="mb-6">
              <label className="block text-[#3E5F44] text-sm font-medium mb-3">Custom Subject*</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (customSubject.trim()) {
                        handlePreferenceChange('subject', customSubject.trim());
                        setShowCustomInput(false);
                        setCustomSubject('');
                      }
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-white text-[#0f172a] rounded-lg border-2 border-[#93DA97]/30 focus:border-[#5E936C] focus:outline-none"
                  placeholder="Enter your custom subject (e.g., Robotics, Creative Writing)"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customSubject.trim()) {
                      handlePreferenceChange('subject', customSubject.trim());
                      setShowCustomInput(false);
                      setCustomSubject('');
                    }
                  }}
                  disabled={!customSubject.trim()}
                  className="px-6 py-2 bg-[#5E936C] text-white rounded-lg hover:bg-[#3E5F44] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomSubject('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Difficulty Selection */}
          <div className="mb-6">
            <label className="block text-[#3E5F44] text-sm font-medium mb-3">Select Difficulty</label>
            <div className="grid grid-cols-3 gap-3">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty.value}
                  onClick={() => handlePreferenceChange('difficulty', difficulty.value)}
                  className={`p-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                    quizPreferences.difficulty === difficulty.value
                      ? difficulty.color === 'green'
                        ? 'bg-[#5E936C]/20 border-[#5E936C] text-[#3E5F44] shadow-sm'
                        : difficulty.color === 'yellow'
                        ? 'bg-yellow-100 border-yellow-500 text-yellow-800 shadow-sm'
                        : 'bg-red-100 border-red-500 text-red-800 shadow-sm'
                      : 'bg-[#E8FFD7] border-[#93DA97]/30 text-[#557063] hover:border-[#5E936C]'
                  }`}
                >
                  {difficulty.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={generateQuiz}
              disabled={loading || !quizPreferences.subject || !quizPreferences.difficulty}
              className="bg-[#5E936C] hover:bg-[#3E5F44] disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-sm disabled:opacity-50"
            >
              <div className="flex items-center space-x-2">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Generating 10 Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Custom Quiz</span>
                  </>
                )}
              </div>
            </button>
            
            <button
              onClick={() => setShowQuizForm(false)}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Quiz Display */}
      {quiz && !showResult && (
        <div className="bg-white border border-[#93DA97]/30 rounded-3xl p-8 shadow-sm">
          {/* Quiz Header with Timer */}
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <div className="flex space-x-4 flex-wrap gap-2">
              <div className="bg-[#E8FFD7] border border-[#93DA97]/30 rounded-full px-4 py-2">
                <span className="text-[#3E5F44] text-sm font-medium">
                  {quiz[0].subject.charAt(0).toUpperCase() + quiz[0].subject.slice(1)}
                </span>
              </div>
              <div className="bg-[#E8FFD7] border border-[#93DA97]/30 rounded-full px-4 py-2">
                <span className="text-[#3E5F44] text-sm font-medium">
                  Question {currentQuestionIndex + 1}/{quiz.length}
                </span>
              </div>
              <div className="bg-[#E8FFD7] border border-[#93DA97]/30 rounded-full px-4 py-2">
                <span className="text-[#3E5F44] text-sm font-medium">
                  {getUserClassLevel()}
                </span>
              </div>
            </div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
              timeLeft <= 60 ? 'bg-red-50 border-red-300 text-red-700' : 'bg-[#E8FFD7] border-[#93DA97]/30 text-[#3E5F44]'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / quiz.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-[#E8FFD7] border border-[#93DA97]/30 rounded-full p-3">
                <Target className="w-6 h-6 text-[#5E936C]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#3E5F44] mb-4">
              {quiz[currentQuestionIndex].question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {quiz[currentQuestionIndex].options.map((option, index) => (
              <button
                key={index}
                onClick={() => selectAnswer(option)}
                className={`w-full p-4 rounded-xl border-2 font-medium text-left transition-all duration-200 ${
                  selectedAnswer === option
                    ? 'bg-[#5E936C]/20 border-[#5E936C] text-[#3E5F44] shadow-sm'
                    : 'bg-[#E8FFD7] border-[#93DA97]/30 text-[#557063] hover:border-[#5E936C]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === option
                      ? 'border-[#5E936C] bg-[#5E936C]'
                      : 'border-gray-400'
                  }`}>
                    {selectedAnswer === option && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-lg">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:opacity-50 border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Previous
            </button>
            
            <div className="text-center">
              {currentQuestionIndex === quiz.length - 1 ? (
                <button
                  onClick={submitQuiz}
                  className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:from-[#3E5F44] hover:to-[#5E936C] text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm"
                >
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>Submit Quiz</span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="bg-[#5E936C] hover:bg-[#3E5F44] text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm"
                >
                  Next Question
                </button>
              )}
            </div>
          </div>

          {/* Answer Status Grid */}
          <div className="mt-6 pt-6 border-t border-[#93DA97]/30">
            <p className="text-[#557063] text-sm mb-3">Question Status:</p>
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: quiz.length }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentQuestionIndex(i);
                    setSelectedAnswer(userAnswers[i] || '');
                  }}
                  className={`w-10 h-10 rounded-lg border-2 text-sm font-bold transition-all duration-200 ${
                    i === currentQuestionIndex
                      ? 'bg-[#5E936C]/30 border-[#5E936C] text-[#3E5F44]'
                      : userAnswers[i]
                      ? 'bg-[#93DA97]/30 border-[#93DA97] text-[#3E5F44]'
                      : 'bg-white border-gray-300 text-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Final Results */}
      {showResult && finalResults && (
        <div className="bg-white border border-[#93DA97]/30 rounded-3xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className={`p-6 rounded-full border-2 ${
                finalResults.score >= 80 
                  ? 'bg-[#93DA97]/30 border-[#5E936C]' 
                  : finalResults.score >= 60
                  ? 'bg-yellow-100 border-yellow-500'
                  : 'bg-red-100 border-red-500'
              }`}>
                <Trophy className={`w-16 h-16 ${
                  finalResults.score >= 80 ? 'text-[#3E5F44]' : 
                  finalResults.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
            </div>

            <h2 className="text-4xl font-bold text-[#3E5F44] mb-2">Quiz Complete!</h2>
            <p className={`text-2xl font-bold mb-4 ${getScoreColor(finalResults.score)}`}>
              {finalResults.score}%
            </p>
            <p className="text-lg text-[#557063] mb-6">
              {getScoreMessage(finalResults.score)}
            </p>

            {finalResults.timeUp && (
              <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-6">
                <p className="text-red-700">⏰ Time's up! Quiz submitted automatically.</p>
              </div>
            )}

            {/* Score Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#93DA97]/20 border border-[#93DA97] rounded-xl p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <CheckCircle className="w-6 h-6 text-[#3E5F44]" />
                  <span className="text-[#3E5F44] font-bold">Correct</span>
                </div>
                <p className="text-2xl font-bold text-[#3E5F44]">{finalResults.correctAnswers}/{finalResults.totalQuestions}</p>
              </div>
              
              <div className="bg-red-50 border border-red-300 rounded-xl p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <span className="text-red-700 font-bold">Incorrect</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{finalResults.totalQuestions - finalResults.correctAnswers}/{finalResults.totalQuestions}</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-300 rounded-xl p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <span className="text-blue-700 font-bold">Time</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{formatTime(finalResults.timeTaken)}</p>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#3E5F44] mb-4">Question Review</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {finalResults.results.map((result, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-xl border-2 ${
                    result.isCorrect 
                      ? 'bg-[#93DA97]/20 border-[#93DA97]' 
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="flex items-start space-x-3 mb-2">
                    {result.isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-[#3E5F44] mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="text-[#3E5F44] font-medium mb-2">
                        <span className="text-gray-500">Q{index + 1}:</span> {result.question}
                      </p>
                      <div className="text-sm space-y-1">
                        <p className="text-[#3E5F44]">
                          <span className="font-medium">Correct Answer:</span> {result.correctAnswer}
                        </p>
                        <p className={result.isCorrect ? 'text-[#3E5F44]' : 'text-red-600'}>
                          <span className="font-medium">Your Answer:</span> {result.userAnswer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowQuizForm(true)}
              className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:from-[#3E5F44] hover:to-[#5E936C] text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-sm"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>New Quiz</span>
              </div>
            </button>
            <button
              onClick={resetQuiz}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateQuizRoomModal
        isOpen={showCreateRoomModal}
        onClose={() => setShowCreateRoomModal(false)}
        onRoomCreated={handleRoomCreated}
      />

      <JoinQuizRoomModal
        isOpen={showJoinRoomModal}
        onClose={() => setShowJoinRoomModal(false)}
        onRoomJoined={handleRoomJoined}
        initialRoomId={searchParams.get('join') || ''}
      />
    </div>
  );
};

export default QuizGenerator;