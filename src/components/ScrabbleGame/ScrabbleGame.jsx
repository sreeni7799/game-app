import React, { useState, useEffect } from 'react';

const GRID_SIZE = 10;

const GameOverScreen = ({ success, wordsFound, wordsTarget, onRestart, onQuit }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
        <h2 className="text-3xl font-bold mb-4 text-green-600">🎉 Game Complete!</h2>
        <div className="text-6xl mb-4">{success ? '🏆' : '📚'}</div>
        <p className="text-xl mb-4">
          {success
            ? `You found ${wordsFound} out of ${wordsTarget} required words!`
            : 'Better luck next time!'}
        </p>
        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
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

const ScrabbleGame = ({ words, level, onBack, onComplete }) => {
  const [grid, setGrid] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const targetWords = words ? words.map(w => w.german.toUpperCase()) : [];
  const wordsTarget = Math.max(5, Math.floor(targetWords.length * 0.6));

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !gameCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleGameEnd();
    }
  }, [timeLeft, gameCompleted]);

  // Initialize grid when words change
  useEffect(() => {
    if (words && words.length > 0) {
      initializeGame();
    }
  }, [words]);

  const initializeGame = () => {
    try {
      // Validate words data
      const validWords = words.filter(word => 
        word && word.german && typeof word.german === 'string'
      ).slice(0, GRID_SIZE);

      if (validWords.length > 0) {
        const newGrid = createScrabbleGrid(validWords, GRID_SIZE);
        setGrid(newGrid);
        setFoundWords([]);
        setSelectedCells([]);
        setCurrentWord('');
        setScore(0);
        setGameCompleted(false);
      }
    } catch (error) {
      console.error('Error initializing Scrabble game:', error);
      // Set a default empty grid
      setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('')));
    }
  };

  const createScrabbleGrid = (words, gridSize) => {
    // Initialize grid with proper bounds
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
    
    words.forEach((word, wordIndex) => {
      const germanWord = word.german.toUpperCase();
      
      // Safe placement with bounds checking
      for (let i = 0; i < germanWord.length && i < gridSize; i++) {
        const row = Math.min(wordIndex, gridSize - 1);
        const col = Math.min(i, gridSize - 1);
        
        // Only place if within bounds
        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
          grid[row][col] = germanWord[i];
        }
      }
    });
    
    // Fill empty cells with random letters
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (grid[row] && grid[row][col] === '') {
          grid[row][col] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }
    
    return grid;
  };

  const handleCellClick = (row, col) => {
    if (gameCompleted) return;

    const cellKey = `${row}-${col}`;
    const isSelected = selectedCells.some(cell => cell.key === cellKey);

    if (isSelected) {
      // Deselect cell
      const newSelected = selectedCells.filter(cell => cell.key !== cellKey);
      setSelectedCells(newSelected);
      setCurrentWord(newSelected.map(cell => cell.letter).join(''));
    } else {
      // Select cell
      const newSelected = [...selectedCells, { 
        key: cellKey, 
        row, 
        col, 
        letter: grid[row] ? grid[row][col] : '' 
      }];
      setSelectedCells(newSelected);
      setCurrentWord(newSelected.map(cell => cell.letter).join(''));
    }
  };

  const handleSubmitWord = () => {
    const word = currentWord.toUpperCase();
    
    if (word.length < 3) {
      alert('Word must be at least 3 letters long!');
      return;
    }

    if (foundWords.includes(word)) {
      alert('Word already found!');
      return;
    }

    if (targetWords.includes(word)) {
      setFoundWords([...foundWords, word]);
      setScore(score + word.length);
      setSelectedCells([]);
      setCurrentWord('');

      // Check if game should end
      if (foundWords.length + 1 >= wordsTarget) {
        handleGameEnd();
      }
    } else {
      alert('Word not found in target list!');
    }
  };

  const handleClearSelection = () => {
    setSelectedCells([]);
    setCurrentWord('');
  };

  const handleGameEnd = () => {
    setGameCompleted(true);
    const success = foundWords.length >= wordsTarget;
    onComplete(success, foundWords.length, targetWords.length);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameCompleted) {
    return (
      <GameOverScreen
        success={foundWords.length >= wordsTarget}
        wordsFound={foundWords.length}
        wordsTarget={wordsTarget}
        onRestart={initializeGame}
        onQuit={onBack}
      />
    );
  }

  if (!grid || grid.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-xl font-semibold text-gray-700">Loading game...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              🔠 Scrabble Game - Level {level}
            </h1>
            <button
              onClick={onBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back
            </button>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-lg">
              Found: <span className="font-bold text-green-600">{foundWords.length}</span> / {wordsTarget}
            </div>
            <div className="text-lg">
              Score: <span className="font-bold text-blue-600">{score}</span>
            </div>
            <div className={`text-lg font-mono ${timeLeft <= 60 ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
              ⏰ {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-center">Find the Words!</h2>
              <div 
                className="grid gap-1 mx-auto"
                style={{ 
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                  maxWidth: '400px'
                }}
              >
                {grid.map((row, rowIndex) => 
                  row && row.map((cell, colIndex) => {
                    const cellKey = `${rowIndex}-${colIndex}`;
                    const isSelected = selectedCells.some(c => c.key === cellKey);
                    
                    return (
                      <button
                        key={cellKey}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        className={`
                          w-12 h-12 border-2 font-bold text-lg transition-colors
                          ${isSelected 
                            ? 'bg-green-200 border-green-500 text-green-800' 
                            : 'bg-gray-50 border-gray-300 hover:bg-gray-100'}
                        `}
                      >
                        {cell}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Current Word */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Current Word</h3>
              <div className="text-center">
                <div className="text-2xl font-mono font-bold mb-4 p-3 bg-gray-100 rounded">
                  {currentWord || '...'}
                </div>
                <div className="space-y-2">
                  <button
                    onClick={handleSubmitWord}
                    disabled={currentWord.length < 3}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Submit Word
                  </button>
                  <button
                    onClick={handleClearSelection}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Target Words */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Target Words</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {targetWords.map((word, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-sm ${
                      foundWords.includes(word)
                        ? 'bg-green-100 text-green-800 line-through'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {word} ({words[index]?.english})
                  </div>
                ))}
              </div>
            </div>

            {/* Found Words */}
            {foundWords.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4">Found Words</h3>
                <div className="space-y-1">
                  {foundWords.map((word, index) => (
                    <div key={index} className="text-green-600 font-semibold">
                      ✅ {word}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrabbleGame;
