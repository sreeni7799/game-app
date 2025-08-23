import React, { useState, useEffect, useCallback } from 'react';

// Card Component
const Card = ({ word, image, pairId, isRevealed, isMatched, onCardFlip, disabled }) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleClick = () => {
    if (disabled || isRevealed || isMatched) {
      shake();
      return;
    }
    onCardFlip();
  };

  const shake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  };

  useEffect(() => {
    if (isRevealed !== undefined) {
      setIsFlipping(true);
      setTimeout(() => setIsFlipping(false), 300);
    }
  }, [isRevealed]);

  return (
    <button
      onClick={handleClick}
      disabled={isMatched}
      className={`
        relative w-24 h-32 bg-gradient-to-br from-blue-400 to-blue-600 
        border-2 border-blue-300 rounded-lg shadow-lg cursor-pointer
        transition-all duration-300 hover:shadow-xl hover:scale-105
        ${isMatched ? 'opacity-60 cursor-not-allowed bg-green-400' : ''}
        ${isShaking ? 'animate-shake' : ''}
        ${isFlipping ? 'animate-flip' : ''}
      `}
      style={{
        transformStyle: 'preserve-3d',
        transform: isRevealed ? 'rotateY(0deg)' : 'rotateY(0deg)'
      }}
    >
      <div className="absolute inset-0 w-full h-full rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex flex-col items-center justify-center p-2">
        {isRevealed ? (
          <>
            <div className="mb-1 flex items-center justify-center h-12">
              {image && image.startsWith('http') ? (
                <img 
                  src={image} 
                  alt={word}
                  className="max-w-full max-h-full object-contain rounded"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : (
                <div className="text-2xl">{image || '📚'}</div>
              )}
              <div className="text-2xl hidden">📚</div>
            </div>
            <div className="text-white text-sm font-bold text-center break-words">
              {word}
            </div>
          </>
        ) : (
          <div className="text-white text-2xl font-bold">?</div>
        )}
      </div>
    </button>
  );
};

// Game Over Screen Component
const GameOverScreen = ({ success, moves, onRestart, onQuit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 text-center shadow-2xl max-w-sm w-full mx-4">
        <h2 className={`text-3xl font-bold mb-4 ${success ? 'text-green-600' : 'text-red-600'}`}>
          {success ? '🎉 Congratulations!' : '😔 Game Over'}
        </h2>
        <p className="text-gray-700 mb-2">
          {success ? 'You matched all pairs!' : 'Better luck next time!'}
        </p>
        <p className="text-gray-600 mb-6">Moves used: {moves}</p>
        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={onQuit}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Back to Levels
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Memory Game Component
const MemoryGame = ({ 
  memoryPairs = null, 
  moveLimit = 30, 
  timeLimit = 90,
  onTaskCompleted = () => {},
  onBackToLevelSelect = () => {},
  selectedLevel = '',
  onRestart = () => {},
  isLoading = false 
}) => {
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [currentMoves, setCurrentMoves] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(timeLimit);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [inputLocked, setInputLocked] = useState(false);

  const MOVE_LIMIT = moveLimit;
  const TIME_LIMIT = timeLimit;

  // Initialize game
  const setupGame = useCallback(() => {
    if (!memoryPairs || !memoryPairs.pairs) {
      return;
    }

    const pairs = memoryPairs.pairs;
    const allWords = [];

    // Create pairs of German and English words
    pairs.forEach(pair => {
      allWords.push({
        word: pair.de,
        pairId: pair.de,
        image: pair.image,
        id: `${pair.de}-de`
      });
      allWords.push({
        word: pair.en,
        pairId: pair.de,
        image: pair.image,
        id: `${pair.de}-en`
      });
    });

    // Shuffle the cards
    const shuffled = allWords.sort(() => Math.random() - 0.5);
    
    setCards(shuffled.map(card => ({
      ...card,
      isRevealed: false,
      isMatched: false
    })));

    // Reset game state
    setSelectedCards([]);
    setMatchedPairs(0);
    setCurrentMoves(0);
    setSecondsLeft(TIME_LIMIT);
    setGameOver(false);
    setGameWon(false);
    setInputLocked(false);
  }, [memoryPairs, TIME_LIMIT]);

  // Timer effect
  useEffect(() => {
    if (secondsLeft <= 0 || gameOver) return;

    const timer = setTimeout(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, gameOver]);

  // Check for time up
  useEffect(() => {
    if (secondsLeft <= 0 && !gameOver) {
      setGameOver(true);
      setGameWon(false);
      onTaskCompleted(false);
    }
  }, [secondsLeft, gameOver, onTaskCompleted]);

  // Handle card flip
  const handleCardFlip = (cardIndex) => {
    if (inputLocked || selectedCards.includes(cardIndex) || cards[cardIndex].isRevealed || cards[cardIndex].isMatched) {
      return;
    }

    if (selectedCards.length >= 2) {
      return;
    }

    // Reveal card
    setCards(prev => prev.map((card, index) => 
      index === cardIndex ? { ...card, isRevealed: true } : card
    ));

    const newSelectedCards = [...selectedCards, cardIndex];
    setSelectedCards(newSelectedCards);

    if (newSelectedCards.length === 2) {
      setInputLocked(true);
      setTimeout(() => checkMatch(newSelectedCards), 300);
    }
  };

  // Check for match
  const checkMatch = (selectedIndices) => {
    if (selectedIndices.length !== 2) {
      setSelectedCards([]);
      setInputLocked(false);
      return;
    }

    const [index1, index2] = selectedIndices;
    const card1 = cards[index1];
    const card2 = cards[index2];

    setCurrentMoves(prev => prev + 1);

    if (card1.pairId === card2.pairId) {
      // Match found
      setCards(prev => prev.map((card, index) => {
        if (index === index1 || index === index2) {
          return { ...card, isMatched: true };
        }
        return card;
      }));

      const newMatchedPairs = matchedPairs + 1;
      setMatchedPairs(newMatchedPairs);
      setSelectedCards([]);
      setInputLocked(false);

      // Check win condition
      if (newMatchedPairs === memoryPairs?.pairs?.length) {
        setGameOver(true);
        setGameWon(true);
        onTaskCompleted(true);
      }
    } else {
      // No match - hide cards after delay
      setTimeout(() => {
        setCards(prev => prev.map((card, index) => {
          if (index === index1 || index === index2) {
            return { ...card, isRevealed: false };
          }
          return card;
        }));
        setSelectedCards([]);
        setInputLocked(false);
      }, 1000);
    }

    // Check move limit
    if (currentMoves + 1 >= MOVE_LIMIT) {
      setTimeout(() => {
        setGameOver(true);
        setGameWon(false);
        onTaskCompleted(false);
      }, 1000);
    }
  };

  // Initialize game on mount
  useEffect(() => {
    setupGame();
  }, [setupGame]);

  const handleRestart = () => {
    onRestart();
  };

  const handleQuit = () => {
    onBackToLevelSelect();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Memory Game</h1>
          {selectedLevel && (
            <p className="text-xl text-white opacity-90 mb-4">Level: {selectedLevel}</p>
          )}
          <div className="flex justify-center space-x-8 text-white">
            <div className="bg-black bg-opacity-30 rounded-lg px-4 py-2">
              <span className="text-lg font-semibold">
                Moves: {currentMoves}/{MOVE_LIMIT}
              </span>
            </div>
            <div className="bg-black bg-opacity-30 rounded-lg px-4 py-2">
              <span className="text-lg font-semibold">
                Time: {secondsLeft}s
              </span>
            </div>
            <div className="bg-black bg-opacity-30 rounded-lg px-4 py-2">
              <span className="text-lg font-semibold">
                Pairs: {matchedPairs}/{memoryPairs?.pairs?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-4 gap-4 justify-items-center mb-6">
          {cards.map((card, index) => (
            <Card
              key={card.id}
              word={card.word}
              image={card.image}
              pairId={card.pairId}
              isRevealed={card.isRevealed}
              isMatched={card.isMatched}
              onCardFlip={() => handleCardFlip(index)}
              disabled={inputLocked}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="text-center">
          <button
            onClick={handleRestart}
            className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-6 rounded-lg shadow-lg transition-all mr-4"
          >
            Restart Game
          </button>
          <button
            onClick={handleQuit}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all"
          >
            Back to Levels
          </button>
        </div>
      </div>

      {/* Game Over Screen */}
      {gameOver && (
        <GameOverScreen
          success={gameWon}
          moves={currentMoves}
          onRestart={handleRestart}
          onQuit={handleQuit}
        />
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(10deg); }
          75% { transform: rotate(-10deg); }
        }

        @keyframes flip {
          0% { transform: scaleX(1); }
          50% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        .animate-flip {
          animation: flip 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default MemoryGame;