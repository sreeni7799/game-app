import React, { useState, useEffect } from 'react';

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
  const [foundWordCells, setFoundWordCells] = useState(new Set());

  // Calculate dynamic grid size based on longest word + 2
  const getGridSize = () => {
    if (!words || words.length === 0) return 8; // Default size
    const maxWordLength = words.reduce((max, word) => Math.max(max, word.german.length), 0);
    return Math.min(Math.max(maxWordLength + 2, 8), 20); // Min 8, Max 20
  };

  const gridSize = getGridSize();
  const targetWords = words ? words.map(w => w.german.toUpperCase()) : [];
  const wordsTarget = Math.max(3, Math.floor(targetWords.length * 0.6));

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

  const createRandomGrid = (size) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array(size).fill(null).map(() =>
      Array(size).fill(null).map(() => alphabet[Math.floor(Math.random() * alphabet.length)])
    );
  };

  const canPlaceWord = (grid, word, row, col, direction) => {
    const wordLen = word.length;
    const size = grid.length;

    for (let i = 0; i < wordLen; i++) {
      const r = direction === 'horizontal' ? row : row + i;
      const c = direction === 'horizontal' ? col + i : col;

      if (r >= size || c >= size) return false; // Out of bounds

      // Check if cell is empty or matches the letter we want to place
      if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
        return false;
      }
    }
    return true;
  };

  const placeWord = (grid, word, row, col, direction) => {
    const wordLen = word.length;

    for (let i = 0; i < wordLen; i++) {
      const r = direction === 'horizontal' ? row : row + i;
      const c = direction === 'horizontal' ? col + i : col;
      grid[r][c] = word[i];
    }
  };

  const initializeGame = () => {
    try {
      // Initialize empty grid
      const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));

      // Shuffle words for random placement
      const shuffledWords = [...words].sort(() => Math.random() - 0.5);

      // Place words randomly
      shuffledWords.forEach((wordObj) => {
        const word = wordObj.german.toUpperCase();
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 100) {
          attempts++;

          // Random direction
          const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';

          // Calculate max starting positions
          const maxRow = direction === 'horizontal' ? gridSize - 1 : gridSize - word.length;
          const maxCol = direction === 'horizontal' ? gridSize - word.length : gridSize - 1;

          if (maxRow >= 0 && maxCol >= 0) {
            const startRow = Math.floor(Math.random() * (maxRow + 1));
            const startCol = Math.floor(Math.random() * (maxCol + 1));

            if (canPlaceWord(newGrid, word, startRow, startCol, direction)) {
              placeWord(newGrid, word, startRow, startCol, direction);
              placed = true;
            }
          }
        }

        // If can't place randomly, try to place sequentially
        if (!placed) {
          outerLoop: for (let row = 0; row <= gridSize - 1; row++) {
            for (let col = 0; col <= gridSize - word.length; col++) {
              if (canPlaceWord(newGrid, word, row, col, 'horizontal')) {
                placeWord(newGrid, word, row, col, 'horizontal');
                placed = true;
                break outerLoop;
              }
            }
          }
        }
      });

      // Fill empty cells with random letters
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          if (newGrid[row][col] === '') {
            newGrid[row][col] = alphabet[Math.floor(Math.random() * alphabet.length)];
          }
        }
      }

      setGrid(newGrid);
      setFoundWords([]);
      setSelectedCells([]);
      setCurrentWord('');
      setScore(0);
      setGameCompleted(false);
      setFoundWordCells(new Set());
    } catch (error) {
      console.error('Error initializing Scrabble game:', error);
      setGrid(createRandomGrid(gridSize));
    }
  };

  const handleCellClick = (row, col) => {
    if (gameCompleted) return;

    const cellKey = `${row}-${col}`;

    if (foundWordCells.has(cellKey)) {
      return;
    }

    const isSelected = selectedCells.some(cell => cell.key === cellKey);

    if (isSelected) {
      const newSelected = selectedCells.filter(cell => cell.key !== cellKey);
      setSelectedCells(newSelected);
      setCurrentWord(newSelected.map(cell => cell.letter).join(''));
    } else {
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
    // Add a brief flash effect before making cells permanently green
    selectedCells.forEach(cell => {
      const cellElement = document.querySelector(`[data-cell="${cell.key}"]`);
      if (cellElement) {
        cellElement.classList.add('animate-pulse');
        setTimeout(() => {
          cellElement.classList.remove('animate-pulse');
        }, 1000);
      }
    });

    // Mark the selected cells as part of a found word
    const newFoundWordCells = new Set([...foundWordCells]);
    selectedCells.forEach(cell => {
      newFoundWordCells.add(cell.key);
    });
    setFoundWordCells(newFoundWordCells);

    setFoundWords([...foundWords, word]);
    setScore(score + word.length);
    setSelectedCells([]);
    setCurrentWord('');

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

  // Calculate responsive cell size based on grid size
  const getCellSize = () => {
    if (gridSize <= 8) return 'w-12 h-12 text-lg';
    if (gridSize <= 12) return 'w-10 h-10 text-base';
    if (gridSize <= 16) return 'w-8 h-8 text-sm';
    return 'w-6 h-6 text-xs';
  };

  const getMaxGridWidth = () => {
    if (gridSize <= 8) return '400px';
    if (gridSize <= 12) return '500px';
    if (gridSize <= 16) return '600px';
    return '700px';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto">
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
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4 text-center">Find the Words!</h2>
              <div className="overflow-auto">
                <div
                  className="grid gap-0.5 mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    maxWidth: getMaxGridWidth()
                  }}
                >
                  {grid.map((row, rowIndex) =>
                    row && row.map((cell, colIndex) => {
                      const cellKey = `${rowIndex}-${colIndex}`;
                      const isSelected = selectedCells.some(c => c.key === cellKey);
                      const isFoundWord = foundWordCells.has(cellKey);

                      return (
                        <button
                          key={cellKey}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          className={`${getCellSize()} border border-gray-300 font-bold transition-colors
                              ${isFoundWord
                              ? 'bg-green-300 border-green-600 text-green-900 cursor-default'
                              : isSelected
                                ? 'bg-blue-200 border-blue-500 text-blue-800'
                                : 'bg-gray-50 hover:bg-gray-100'}
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
                    className={`p-2 rounded text-sm ${foundWords.includes(word)
                      ? 'bg-green-100 text-green-800 line-through'
                      : 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    {words[index]?.english.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>

            {/* Found Words */}
            {foundWords.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4">Found Words</h3>
                <div className="space-y-1 max-h-32 overflow-y-auto">
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
