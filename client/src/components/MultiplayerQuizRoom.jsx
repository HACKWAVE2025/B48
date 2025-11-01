import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Users, Crown, Play, Clock, Trophy, ArrowLeft, Hash, CheckCircle, Wifi, WifiOff, UserPlus, AlertCircle } from 'lucide-react';

const MultiplayerQuizRoom = ({ room, onLeave }) => {
  // Quiz state - reusing existing QuizGenerator logic
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  // Remove finalResults, as we will get results from the server
  // const [finalResults, setFinalResults] = useState(null);
  // --- ADD new state for multiplayer results ---
  const [leaderboard, setLeaderboard] = useState(null);
  const [liveResults, setLiveResults] = useState([]);

  // Room state - simple structure
  const [host, setHost] = useState(room.host || null);
  const [participants, setParticipants] = useState(room.participants || []);
  const [roomStatus, setRoomStatus] = useState(room.status || 'waiting');
  const [isHost, setIsHost] = useState(room.isHost || false);
  const [startingQuiz, setStartingQuiz] = useState(false);
  const [roomMessage, setRoomMessage] = useState('');

  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    console.log('=== MULTIPLAYER QUIZ ROOM MOUNT ===');
    console.log('Room prop:', room);
    console.log('Is host:', isHost);
    console.log('Socket connected:', !!socket);

    if (!socket) {
      console.log('No socket connection available');
      return;
    }

    // If this is a newly created room (host), emit createRoom
    if (room.isHost && room.roomId) {
      console.log('Emitting createRoom for host');
      socket.emit('createRoom', {
        roomId: room.roomId,
        username: user?.name || 'Host'
      });
    }
    // If joining an existing room, emit joinRoom
    else if (!room.isHost && room.roomId) {
      console.log('Emitting joinRoom for participant');
      socket.emit('joinRoom', {
        roomId: room.roomId,
        username: user?.name || 'Participant'
      });
    }

    // Socket event listeners
    socket.on('roomCreated', handleRoomCreated);
    socket.on('roomData', handleRoomData);
    socket.on('quizStarted', handleQuizStarted);
    // --- ADD listeners for multiplayer end-game events ---
    socket.on('participantFinished', handleParticipantFinished);
    socket.on('multiplayerQuizEnded', handleMultiplayerQuizEnded);
    socket.on('error', handleError);

    return () => {
      console.log('MultiplayerQuizRoom unmounting');
      socket.off('roomCreated');
      socket.off('roomData');
      socket.off('quizStarted');
      // --- REMOVE listeners on cleanup ---
      socket.off('participantFinished');
      socket.off('multiplayerQuizEnded');
      socket.off('error');
    };
  }, [socket, room.roomId]);

  // Timer effect for quiz
  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0 && !quizFinished) {
      timer = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [quizStarted, timeLeft, quizFinished]);

  // Socket event handlers
  const handleRoomCreated = (data) => {
    console.log('Room created confirmation:', data);
  };

  const handleRoomData = (data) => {
    console.log('=== ROOM DATA RECEIVED ===');
    console.log('Room data:', data);
    
    // Update room state
    if (data.host) {
      setHost(data.host);
    }
    
    if (data.participants) {
      setParticipants(data.participants);
    }
    
    if (data.status) {
      setRoomStatus(data.status);
    }
    
    if (data.message) {
      setRoomMessage(data.message);
      // Clear message after 5 seconds
      setTimeout(() => {
        setRoomMessage('');
      }, 5000);
    }
    
    console.log('Updated participants:', data.participants?.length || 0);
    console.log('=== ROOM DATA UPDATE COMPLETE ===');
  };

  const handleQuizStarted = (data) => {
    console.log('=== QUIZ STARTED ===');
    console.log('Quiz data:', data);
    
    // Set quiz data - this triggers the existing quiz component logic
    setQuiz(data.quiz);
    setUserAnswers(new Array(data.quiz.length).fill(null));
    setTimeLeft(data.timeLimit);
    setQuizStarted(true);
    setRoomStatus('active');
    setCurrentQuestionIndex(0);
    setStartingQuiz(false);
    setSelectedAnswer('');
    // Initialize live results tracker when quiz starts
    if (host && participants) {
      const allPlayers = [{id: host.id, name: host.name}, ...participants];
      setLiveResults(allPlayers.map(p => ({ ...p, finished: false })));
    }
    
    if (data.message) {
      setRoomMessage(data.message);
      setTimeout(() => {
        setRoomMessage('');
      }, 3000);
    }
    
    console.log('Quiz started with', data.quiz.length, 'questions');
    console.log('=== QUIZ START COMPLETE ===');
  };

  // --- ADD new handlers for receiving results from server ---
  const handleParticipantFinished = (data) => {
    console.log('A participant finished:', data);
    // Update the live results to show who has finished
    setLiveResults(data.results.map(r => ({ id: r.id, name: r.name, finished: r.finished })));
    setRoomMessage(`${data.name} has finished the quiz!`);
    setTimeout(() => setRoomMessage(''), 3000);
  };

  const handleMultiplayerQuizEnded = (data) => {
    console.log('=== MULTIPLAYER QUIZ ENDED, FINAL RESULTS: ===', data);
    setLeaderboard(data.leaderboard);
    setQuizFinished(true); // This will trigger the final results screen
    setQuizStarted(false);
    setRoomStatus('finished');
    
    // Trigger analytics refresh across tabs
    localStorage.setItem('activityCompleted', Date.now().toString());
  };

  const handleError = (data) => {
    console.error('Room error:', data);
    alert(data.message);
    setStartingQuiz(false);
  };

  // Host starts quiz
  const startQuiz = () => {
    if (socket && isHost && room.roomId) {
      setStartingQuiz(true);
      console.log('Host starting quiz for room:', room.roomId);
      socket.emit('startQuiz', { roomId: room.roomId });
    }
  };

  // Quiz functionality - reusing existing logic from QuizGenerator
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
      submitQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1] || '');
    }
  };

  const submitQuiz = () => {
    // --- UPDATE to emit results to server instead of calculating locally ---
    let correctAnswers = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === quiz[index]?.answer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / quiz.length) * 100);
    const timeTaken = 600 - timeLeft;

    console.log('Submitting my results to server:', { score, timeTaken });
    socket.emit('submitMultiplayerQuiz', {
      roomId: room.roomId,
      score,
      timeTaken
    });
    
    // Set state to show the "waiting" screen
    setQuizFinished(true);
    setQuizStarted(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // --- REPLACE the entire results display with the new multiplayer logic ---
  if (quizFinished) {
    // If we are waiting for the final results from the server
    if (!leaderboard) {
      return (
        <div className="max-w-4xl mx-auto p-6 text-center">
          <div className="bg-white backdrop-blur-sm border border-[#93DA97]/30 rounded-xl p-8 shadow-md">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#5E936C] border-t-transparent mx-auto mb-6"></div>
            <h1 className="text-3xl font-bold text-[#3E5F44] mb-2">Quiz Submitted!</h1>
            <p className="text-[#557063] text-lg mb-6">⏳ Waiting for other participants to finish…</p>
            
            {/* Live progress of who has finished */}
            <div className="text-left max-w-md mx-auto space-y-2">
              <h3 className="text-[#3E5F44] font-semibold mb-3">Live Status:</h3>
              {liveResults.map(player => (
                <div key={player.id} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${player.finished ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <span className="text-[#3E5F44]">{player.name}</span>
                  {player.finished ? (
                    <span className="flex items-center space-x-2 text-green-600 font-bold">
                      <CheckCircle className="w-5 h-5" />
                      <span>Finished</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2 text-gray-500">
                      <Clock className="w-5 h-5" />
                      <span>Playing...</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // When the final leaderboard is received from the server
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-full shadow-lg mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#3E5F44] mb-2">Quiz Over!</h1>
          <p className="text-[#557063]">Final Leaderboard for Room: {room.roomId}</p>
        </div>

        {/* Winner Display */}
        {leaderboard && leaderboard.length > 0 && (
            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-6 mb-8 text-center shadow-lg">
                <h2 className="text-xl font-bold text-yellow-700 mb-2 flex items-center justify-center space-x-2">
                    <Crown className="w-6 h-6" />
                    <span>WINNER</span>
                    <Crown className="w-6 h-6" />
                </h2>
                <p className="text-3xl font-bold text-[#3E5F44]">{leaderboard[0].name}</p>
                <div className="flex justify-center space-x-6 mt-2 text-[#557063]">
                    <span>Score: <span className="font-bold">{leaderboard[0].score}%</span></span>
                    <span>Time: <span className="font-bold">{leaderboard[0].time.toFixed(2)}s</span></span>
                </div>
            </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white backdrop-blur-sm border border-[#93DA97]/30 rounded-xl p-6 mb-8 shadow-md">
          <h3 className="text-xl font-bold text-[#3E5F44] mb-4">Final Standings</h3>
          <div className="space-y-3">
            {leaderboard.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg transition-all duration-500 ${
                  index === 0
                    ? 'bg-yellow-100 border border-yellow-400' 
                    : 'bg-[#E8FFD7]/30 border border-[#93DA97]/50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className={`text-2xl font-bold w-8 text-center ${index === 0 ? 'text-yellow-600' : 'text-[#3E5F44]'}`}>#{index + 1}</span>
                  <span className="text-[#3E5F44] font-semibold text-lg">{player.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-[#3E5F44] font-bold text-xl">{player.score}%</p>
                  <p className="text-[#557063] text-sm">Time: {player.time.toFixed(2)}s</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onLeave}
            className="bg-gray-100 hover:bg-gray-200 text-[#3E5F44] font-bold py-3 px-6 rounded-xl flex items-center space-x-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Quiz Menu</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Room Header */}
      <div className="bg-white backdrop-blur-sm border border-[#93DA97]/30 rounded-xl p-6 mb-8 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3E5F44]">Quiz Room</h1>
            <div className="flex items-center space-x-4 text-[#557063]">
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4" />
                <span className="font-mono">{room.roomId}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{participants?.length + 1 || 1} members</span>
              </div>
            </div>
          </div>
          <button
            onClick={onLeave}
            className="bg-gray-100 hover:bg-gray-200 text-[#3E5F44] px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Room Message */}
        {roomMessage && (
          <div className="mb-4 bg-green-100 border border-green-300 rounded-lg p-3 animate-fade-in">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4 text-green-600" />
              <p className="text-green-700 text-sm">{roomMessage}</p>
            </div>
          </div>
        )}

        {/* Host Info */}
        {host && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-blue-500" />
                <span className="text-blue-700">Host: {host.name}</span>
                <Wifi className="w-4 h-4 text-green-500" />
              </div>
              {isHost && (
                <span className="bg-blue-100 px-2 py-1 rounded text-blue-700 text-sm">
                  You are the host
                </span>
              )}
            </div>
          </div>
        )}

        {/* Live Participants List */}
        <div className="mb-6">
          <h3 className="text-[#3E5F44] font-semibold mb-3 flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Participants ({participants?.length || 0})</span>
          </h3>
          
          {!participants || participants.length === 0 ? (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No participants yet</p>
              {isHost && (
                <p className="text-gray-400 text-sm mt-1">Share the room ID with others to invite them</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {participants.map((participant, index) => (
                <div
                  key={`${participant.id}-${index}`}
                  className="bg-green-100 border border-green-300 rounded-lg px-3 py-2 flex items-center justify-between transition-all duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-[#3E5F44]">
                      {participant.name}
                    </span>
                  </div>
                  <Wifi className="w-4 h-4 text-green-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quiz Control */}
        {!quizStarted && roomStatus === 'waiting' && (
          <div>
            {isHost ? (
              <div className="space-y-3">
                {(!participants || participants.length < 1) && (
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <p className="text-yellow-700 text-sm">
                        💡 You can start the quiz now, or wait for more participants to join...
                      </p>
                    </div>
                  </div>
                )}
                
                {participants && participants.length >= 1 && (
                  <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-green-700 text-sm">
                        🎉 Great! You have {participants.length + 1} member{participants.length > 0 ? 's' : ''} ready to start!
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={startQuiz}
                  disabled={startingQuiz}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  {startingQuiz ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Starting Quiz...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>
                        Start Quiz ({(participants?.length || 0) + 1} member{(participants?.length || 0) > 0 ? 's' : ''})
                      </span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <p className="text-blue-700">
                    Waiting for <span className="font-semibold">{host?.name || 'host'}</span> to start the quiz...
                  </p>
                </div>
                <p className="text-blue-600 text-sm mt-1">
                  {(participants?.length || 0) + 1} member{(participants?.length || 0) > 0 ? 's' : ''} in room
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quiz Component - Reusing existing quiz logic */}
      {quizStarted && quiz && (
        <div className="backdrop-blur-xl bg-white/90 border border-[#93DA97]/50 rounded-3xl p-8 shadow-2xl">
          {/* Quiz Header with Timer */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <div className="bg-[#93DA97]/30 border border-[#5E936C]/50 rounded-lg px-4 py-2">
                <span className="text-[#557063] text-sm">Question</span>
                <p className="text-[#3E5F44] font-bold">{currentQuestionIndex + 1} of {quiz.length}</p>
              </div>
              <div className="bg-blue-100 border border-blue-300 rounded-lg px-4 py-2">
                <span className="text-blue-700 text-sm">Room</span>
                <p className="text-[#3E5F44] font-bold">{room.roomId}</p>
              </div>
            </div>
            
            <div className="bg-red-100 border border-red-300 rounded-lg px-4 py-2 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-red-600" />
              <span className="text-red-700 text-sm">Time Left</span>
              <p className="text-[#3E5F44] font-bold">{formatTime(timeLeft)}</p>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#3E5F44] mb-6 leading-relaxed">
              {quiz[currentQuestionIndex]?.question}
            </h2>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quiz[currentQuestionIndex]?.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(option)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                    selectedAnswer === option
                      ? 'bg-[#93DA97]/50 border-[#5E936C] text-[#3E5F44] transform scale-105 shadow-md'
                      : 'bg-[#E8FFD7]/30 border-[#93DA97]/50 text-[#3E5F44] hover:bg-[#93DA97]/20 hover:border-[#5E936C]'
                  }`}
                >
                  <span className="font-medium">{String.fromCharCode(65 + index)}. </span>
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-[#3E5F44] font-bold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Previous
            </button>

            <div className="flex space-x-2">
              {Array.from({ length: quiz.length }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i === currentQuestionIndex
                      ? 'bg-[#5E936C]'
                      : userAnswers[i]
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextQuestion}
              className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:shadow-lg text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
            >
              {currentQuestionIndex === quiz.length - 1 ? 'Submit Quiz' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiplayerQuizRoom;