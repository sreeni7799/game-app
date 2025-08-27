import React, { useState, useEffect } from 'react';

const AnagramGame = ({ words, level, onBack, onComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [completedWords, setCompletedWords] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [showHint, setShowHint] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const currentWord = words[currentWordIndex];
  const targetWordCount = Math.min(8, words.length);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !gameCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleGameEnd();
    }
  }, [timeLeft, gameCompleted]);

  // Initialize shuffled letters when word changes
  useEffect(() => {
    if (currentWord) {
      const letters = currentWord.germanWord.split('');
      setShuffledLetters(shuffleArray([...letters]));
      setUserInput('');
      setFeedback('');
      setShowHint(false);
    }
  }, [currentWordIndex, currentWord]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleLetterClick = (letter, index) => {
    if (userInput.length < currentWord.germanWord.length) {
      setUserInput(userInput + letter);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= currentWord.germanWord.length) {
      setUserInput(value);
    }
  };

  const handleSubmit = () => {
    if (userInput.toUpperCase() === currentWord.germanWord.toUpperCase()) {
      setFeedback('Correct! Well done!');
      setScore(score + (showHint ? 2 : 3)); // Less points if hint was used
      setCompletedWords(completedWords + 1);
      
      setTimeout(() => {
        if (currentWordIndex < targetWordCount - 1) {
          setCurrentWordIndex(currentWordIndex + 1);
        } else {
          handleGameEnd();
        }
      }, 1500);
    } else {
      setFeedback('Not quite right. Try again!');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const handleSkip = () => {
    if (currentWordIndex < targetWordCount - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      handleGameEnd();
    }
  };

  const handleGameEnd = () => {
    setGameCompleted(true);
    const success = completedWords >= 5; // Need at least 5 correct for success
    onComplete(success, completedWords, targetWordCount);
  };

  const clearInput = () => {
    setUserInput('');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!currentWord) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-800 text-center sm:text-left">
            Anagram Game - Health Words
          </h1>
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Back to Levels
          </button>
        </div>

        {/* Game Stats */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-lg">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{completedWords}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{targetWordCount}</div>
              <div className="text-sm text-gray-600">Total Words</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-orange-600'}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-600">Time Left</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Game Area */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">Rearrange the letters to form:</h2>
              <div className="text-lg text-gray-600 mb-2">
                English: <span className="font-semibold">{currentWord.english}</span>
              </div>
              {showHint && (
                <div className="text-md text-blue-600 mb-2">
                  Hint: Starts with "{currentWord.germanWord.charAt(0).toUpperCase()}"
                </div>
              )}
            </div>

            {/* Shuffled Letters */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-center">Available Letters:</h3>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {shuffledLetters.map((letter, index) => (
                  <button
                    key={index}
                    onClick={() => handleLetterClick(letter, index)}
                    className="w-12 h-12 bg-purple-200 hover:bg-purple-300 border-2 border-purple-400 rounded-lg text-lg font-bold text-purple-800 transition-all duration-200 active:scale-95 touch-manipulation"
                  >
                    {letter.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-center">Your Answer:</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  placeholder="Type or click letters above"
                  className="flex-1 p-3 border-2 border-gray-300 rounded-lg text-center text-lg font-semibold uppercase"
                  maxLength={currentWord.germanWord.length}
                />
                <button
                  onClick={clearInput}
                  className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleSubmit}
                disabled={!userInput}
                className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold rounded-lg transition-colors touch-manipulation"
              >
                Submit Answer
              </button>
              <button
                onClick={() => setShowHint(true)}
                disabled={showHint}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold rounded-lg transition-colors"
              >
                {showHint ? 'Hint Shown' : 'Show Hint'}
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors"
              >
                Skip Word
              </button>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`mt-4 p-3 rounded-lg text-center font-bold ${
                feedback.includes('Correct') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {feedback}
              </div>
            )}
          </div>

          {/* Word Progress */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4">Progress</h3>
            <div className="space-y-3">
              {words.slice(0, targetWordCount).map((word, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-2 flex justify-between items-center ${
                    index === currentWordIndex
                      ? 'border-purple-400 bg-purple-50'
                      : index < currentWordIndex
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{word.english}</div>
                    <div className="text-sm text-gray-600">
                      {index < currentWordIndex ? word.germanWord : '???'}
                    </div>
                  </div>
                  <div className="text-2xl">
                    {index === currentWordIndex ? '⏳' : index < currentWordIndex ? '✅' : '⭕'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Game Over Screen Component
const AnagramGameOverScreen = ({ success, completedWords, totalWords, score, onRestart, onQuit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 text-center shadow-2xl max-w-md w-full">
        <h2 className={`text-3xl font-bold mb-4 ${success ? 'text-green-600' : 'text-orange-600'}`}>
          {success ? '🎉 Excellent!' : '⏰ Time\'s Up!'}
        </h2>
        <p className="text-lg mb-2">
          You completed <span className="font-bold text-purple-600">{completedWords}</span> out of{' '}
          <span className="font-bold">{totalWords}</span> words!
        </p>
        <p className="text-lg mb-6">
          Final Score: <span className="font-bold text-green-600">{score}</span> points
        </p>
        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={onQuit}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Back to Levels
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnagramGame;
export { AnagramGameOverScreen };
