import React, { useState, useEffect } from 'react';

const GameOverScreen = ({ score, total, onRestart, onQuit, scenario, level, topic }) => {
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= 70; // 70% passing grade

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="text-6xl mb-4">
          {passed ? '🎉' : '📚'}
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {passed ? 'Congratulations!' : 'Keep Learning!'}
        </h2>
        <p className="text-gray-600 mb-2">
          You scored {score} out of {total} questions correctly
        </p>
        <p className="text-lg font-semibold mb-2 text-blue-600">
          {percentage}%
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Scenario: {scenario?.name} | Level: {level}
        </p>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={onRestart}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onQuit}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Scenarios
          </button>
        </div>
      </div>
    </div>
  );
};

const QuizGame = ({ questions, level, onBack, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [gameCompleted, setGameCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !selectedAnswer && !gameCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !selectedAnswer) {
      // Time's up - auto select wrong answer
      handleAnswer('TIME_UP');
    }
  }, [timeLeft, selectedAnswer, gameCompleted]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(30);
  }, [currentIndex]);

  const handleAnswer = (answer) => {
    if (selectedAnswer) return;
    
    setSelectedAnswer(answer);
    
    if (answer === currentQuestion.correct) {
      setScore(score + 1);
    }

    // Auto advance to next question after 2 seconds
    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setGameCompleted(true);
        onComplete({
          score,
          total: questions.length,
          percentage: Math.round((score / questions.length) * 100)
        });
      } else {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
      }
    }, 2000);
  };

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <h2 className="text-3xl font-bold mb-4 text-yellow-600">🎉 Quiz Complete!</h2>
          <div className="text-6xl mb-4">{score >= questions.length * 0.7 ? '🏆' : '📚'}</div>
          <p className="text-xl mb-4">
            You scored <span className="font-bold text-green-600">{score}</span> out of{' '}
            <span className="font-bold">{questions.length}</span>
          </p>
          <p className="text-lg mb-6">
            That's <span className="font-bold">{Math.round((score / questions.length) * 100)}%</span>!
          </p>
          <button
            onClick={onBack}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Back to Levels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              📚 German Quiz - Level {level}
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
              Question <span className="font-bold">{currentIndex + 1}</span> of{' '}
              <span className="font-bold">{questions.length}</span>
            </div>
            <div className="text-lg">
              Score: <span className="font-bold text-green-600">{score}</span>
            </div>
            <div className={`text-lg font-mono ${timeLeft <= 5 ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
              ⏰ {timeLeft}s
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            {currentQuestion.question}
          </h2>

          {/* Answer choices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.choices.map((choice, index) => {
              const isCorrect = choice === currentQuestion.correct;
              const isSelected = selectedAnswer === choice;
              const showResult = selectedAnswer !== null;
              
              let buttonClass = 'w-full p-4 rounded-lg border-2 text-left transition-all duration-300 ';
              
              if (!showResult) {
                buttonClass += 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300';
              } else {
                if (isCorrect) {
                  buttonClass += 'bg-green-100 border-green-500 text-green-800';
                } else if (isSelected) {
                  buttonClass += 'bg-red-100 border-red-500 text-red-800';
                } else {
                  buttonClass += 'bg-gray-100 border-gray-300 text-gray-600';
                }
              }

              return (
                <button
                  key={choice}
                  onClick={() => handleAnswer(choice)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 text-sm font-bold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {choice}
                    {showResult && isCorrect && <span className="ml-auto text-2xl">✅</span>}
                    {showResult && isSelected && !isCorrect && <span className="ml-auto text-2xl">❌</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {selectedAnswer && (
            <div className="mt-6 text-center">
              {selectedAnswer === currentQuestion.correct ? (
                <div className="text-green-600 font-bold text-xl">
                  ✅ Correct! Well done!
                </div>
              ) : selectedAnswer === 'TIME_UP' ? (
                <div className="text-orange-600 font-bold text-xl">
                  ⏰ Time's up! The answer was: {currentQuestion.correct}
                </div>
              ) : (
                <div className="text-red-600 font-bold text-xl">
                  ❌ Incorrect. The correct answer was: {currentQuestion.correct}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizGame;
