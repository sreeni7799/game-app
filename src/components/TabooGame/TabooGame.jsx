import React, { useState, useEffect } from 'react';

const TabooGame = ({ entries, level, onBack, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40); // 40 seconds per round like Godot
  const [gamePhase, setGamePhase] = useState('ready'); // 'ready', 'playing', 'completed'
  const [userGuess, setUserGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [roundResult, setRoundResult] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);

  const currentEntry = entries[currentIndex];
  const maxRounds = Math.min(10, entries.length);

  // Timer effect
  useEffect(() => {
    if (gamePhase === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gamePhase === 'playing') {
      handleTimeUp();
    }
  }, [timeLeft, gamePhase]);

  const startRound = () => {
    setGamePhase('playing');
    setTimeLeft(40);
    setUserGuess('');
    setFeedback('');
    setRoundResult(null);
  };

  const handleGuess = () => {
    const guess = userGuess.trim().toLowerCase();
    const correct = currentEntry.word.toLowerCase();
    
    if (guess === correct) {
      setScore(score + 2); // 2 points like Godot
      setFeedback('✅ Correct! Well done!');
      setRoundResult('correct');
      setTimeout(() => nextRound(), 2000);
    } else {
      setFeedback('❌ Not quite right. Try again!');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const handleSkip = () => {
    setFeedback('⏭️ Skipped this word');
    setRoundResult('skipped');
    setTimeout(() => nextRound(), 1500);
  };

  const handleTimeUp = () => {
    setGamePhase('ready');
    setFeedback('⏰ Time\'s up!');
    setRoundResult('timeout');
    setTimeout(() => nextRound(), 2000);
  };

  const nextRound = () => {
    if (currentIndex + 1 >= maxRounds) {
      setGameCompleted(true);
      onComplete({
        score,
        total: maxRounds,
        percentage: Math.round((score / (maxRounds * 2)) * 100)
      });
    } else {
      setCurrentIndex(currentIndex + 1);
      setGamePhase('ready');
      setTimeLeft(40);
      setUserGuess('');
      setFeedback('');
      setRoundResult(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <h2 className="text-3xl font-bold mb-4 text-purple-600">🎉 Game Complete!</h2>
          <div className="text-6xl mb-4">{score >= maxRounds ? '🏆' : '🚫'}</div>
          <p className="text-xl mb-4">
            You scored <span className="font-bold text-green-600">{score}</span> out of{' '}
            <span className="font-bold">{maxRounds * 2}</span> possible points
          </p>
          <p className="text-lg mb-6">
            That's <span className="font-bold">{Math.round((score / (maxRounds * 2)) * 100)}%</span>!
          </p>
          <button
            onClick={onBack}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Back to Levels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              🚫 Taboo Game - Level {level}
            </h1>
            <button
              onClick={onBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back
            </button>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-lg">
              Round <span className="font-bold">{currentIndex + 1}</span> of{' '}
              <span className="font-bold">{maxRounds}</span>
            </div>
            <div className="text-lg">
              Score: <span className="font-bold text-green-600">{score}</span>
            </div>
            <div className={`text-lg font-mono ${timeLeft <= 10 ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
              ⏰ {formatTime(timeLeft)}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex) / maxRounds) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Guess this German word:
            </h2>
            <div className="text-6xl font-bold text-purple-600 mb-4">
              ???
            </div>
          </div>

          {/* Clues Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Hints */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-3">💡 Hints:</h3>
              <div className="space-y-2">
                <div className="text-sm bg-white p-2 rounded">
                  {currentEntry.hint}
                </div>
                {currentEntry.clues.map((clue, index) => (
                  <div key={index} className="text-sm bg-white p-2 rounded">
                    {clue}
                  </div>
                ))}
              </div>
            </div>

            {/* Taboo Words */}
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-bold text-red-800 mb-3">🚫 Don't say these words:</h3>
              <div className="grid grid-cols-1 gap-2">
                {currentEntry.tabooWords.map((word, index) => (
                  <div key={index} className="text-sm bg-red-100 text-red-800 p-2 rounded font-semibold text-center">
                    {word}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Game Controls */}
          {gamePhase === 'ready' ? (
            <div className="text-center">
              <button
                onClick={startRound}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
              >
                Start Round
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Guess Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
                  placeholder="Enter your guess..."
                  className="flex-1 p-3 border-2 border-gray-300 rounded-lg text-lg"
                />
                <button
                  onClick={handleGuess}
                  disabled={!userGuess.trim()}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Guess
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleSkip}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Skip Word
                </button>
              </div>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div className="mt-6 text-center">
              <div className="text-xl font-bold">
                {feedback}
              </div>
              {roundResult === 'correct' && (
                <div className="text-green-600 mt-2">
                  The word was: <span className="font-bold">{currentEntry.word}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabooGame;
