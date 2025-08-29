import React, { useState, useEffect } from 'react';

const GameOverScreen = ({ success, wordsFound, wordsTarget, onRestart, onQuit }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center shadow-2xl max-w-sm w-full mx-4">
                <h2 className={`text-3xl font-bold mb-4 ${success ? 'text-green-600' : 'text-red-600'}`}>
                    {success ? '🎉 Congratulations!' : '😔 Game Over'}
                </h2>
                <p className="text-gray-700 mb-2">
                    {success
                        ? `You found ${wordsFound} out of ${wordsTarget} required words!`
                        : 'Better luck next time!'}
                </p>
                <div className="space-y-3 mt-6">
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

// Utility: place words randomly (horizontal, vertical, diagonal)
function createScrabbleGrid(words, gridSize = 8) {
    const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
    const placedWords = [];

    const directions = [
        { name: 'horizontal', dr: 0, dc: 1 },
        { name: 'vertical', dr: 1, dc: 0 },
        { name: 'diagonal', dr: 1, dc: 1 }
    ];

    words.forEach(({ german, english, image }) => {
        const word = german.toUpperCase();
        let placed = false;
        for (let tries = 0; tries < 100 && !placed; tries++) {
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const maxRow = gridSize - (dir.dr ? word.length : 0);
            const maxCol = gridSize - (dir.dc ? word.length : 0);
            const row = Math.floor(Math.random() * maxRow);
            const col = Math.floor(Math.random() * maxCol);

            // Check fit (allow overlap if letters match)
            let fits = true;
            for (let k = 0; k < word.length; k++) {
                const r = row + dir.dr * k;
                const c = col + dir.dc * k;
                if (grid[r][c] && grid[r][c] !== word[k]) {
                    fits = false;
                    break;
                }
            }
            if (fits) {
                for (let k = 0; k < word.length; k++) {
                    const r = row + dir.dr * k;
                    const c = col + dir.dc * k;
                    grid[r][c] = word[k];
                }
                placedWords.push({
                    word,
                    english,
                    image,
                    start: [row, col],
                    direction: dir,
                    length: word.length
                });
                placed = true;
            }
        }
    });

    // Fill remaining cells
    const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ";
    for (let i = 0; i < gridSize; i++)
        for (let j = 0; j < gridSize; j++)
            if (!grid[i][j]) grid[i][j] = ALPHA[Math.floor(Math.random() * ALPHA.length)];

    return { grid, placedWords };
}

// Cell styled similar to MemoryGame cards
const ScrabbleCell = ({ letter, selectedIdx, foundIdx, cellIdx, onClick }) => (
    <button
        className={`
      w-12 h-12 shadow-lg rounded-xl 
      font-bold text-xl border-2 m-1 
      transition-colors duration-100 select-none
      ${foundIdx
                ? 'bg-green-500 border-green-600 text-white'
                : selectedIdx
                    ? 'bg-blue-400 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-blue-50'
            }
    `}
        onClick={onClick}
        tabIndex={-1}
    >
        {letter}
    </button>
);

function getSelectionDirection(selection) {
    if (selection.length < 2) return null;
    const dr = selection[1][0] - selection[0][0];
    const dc = selection[1][1] - selection[0][1];
    if (dr === 0 && dc !== 0) return { dr: 0, dc: Math.sign(dc) };
    if (dc === 0 && dr !== 0) return { dr: Math.sign(dr), dc: 0 };
    if (Math.abs(dr) === Math.abs(dc) && dr !== 0) return { dr: Math.sign(dr), dc: Math.sign(dc) };
    return null;
}
function isSelectionContiguous(selection) {
    if (selection.length < 2) return false;
    const dir = getSelectionDirection(selection);
    if (!dir) return false;
    for (let i = 1; i < selection.length; i++) {
        if (
            selection[i][0] !== selection[i - 1][0] + dir.dr ||
            selection[i][1] !== selection[i - 1][1] + dir.dc
        ) {
            return false;
        }
    }
    return true;
}

// Tooltip for image on hover
const WordTooltip = ({ image }) =>
    image ? (
        <div className="absolute left-full ml-3 z-40 w-20 h-20 bg-white p-2 border rounded shadow-xl flex items-center justify-center">
            <img src={image} alt="" className="max-w-full max-h-full rounded" />
        </div>
    ) : null;

// Word list styled + image hover
const WordsToFindList = ({ placedWords, foundWords }) => {
  const [revealedIndex, setRevealedIndex] = useState(null);

  return (
    <ul className="space-y-4">
      {placedWords.map((word, i) => (
        <li key={i}>
          <div className="p-3 rounded-lg border-2 shadow-lg flex items-center justify-between">
            <span className="text-lg font-bold">{word.english}</span>
            <button onClick={() => setRevealedIndex(revealedIndex === i ? null : i)}>
              {revealedIndex === i ? "Hide Image" : "Show Image"}
            </button>
          </div>
          
          {/* Use MemoryGame's exact image display approach */}
          {revealedIndex === i && (
            <div className="mt-4 p-4 bg-white border rounded-xl shadow-lg">
              <div className="mb-1 flex items-center justify-center h-24">
                {word.image && word.image.startsWith('http') ? (
                  <img 
                    src={word.image} 
                    alt={word.english}
                    className="max-w-full max-h-full object-contain rounded"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="text-4xl">{word.image || '📚'}</div>
                )}
              </div>
              <div className="text-center font-bold">{word.english}</div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

const ScrabbleGame = ({
    words,
    gridSize = 8,
    onTaskCompleted,
    onRestart,
    selectedLevel,
    onBack
}) => {
    const [{ grid, placedWords }, setGameGrid] = useState({ grid: [], placedWords: [] });
    const [selectedCells, setSelectedCells] = useState([]);
    const [foundWords, setFoundWords] = useState(new Set());
    const [message, setMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState(300);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        setGameGrid(createScrabbleGrid(words, gridSize));
        setSelectedCells([]);
        setFoundWords(new Set());
        setMessage('');
        setGameOver(false);
        setTimeLeft(300);
    }, [words, gridSize]);

    useEffect(() => {
        if (!gameOver && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
        if (timeLeft === 0) setGameOver(true);
    }, [gameOver, timeLeft]);

    const handleCellClick = (row, col) => {
        const cellIdx = selectedCells.findIndex(([r, c]) => r === row && c === col);
        if (cellIdx >= 0) {
            setSelectedCells(selectedCells.filter((_, i) => i !== cellIdx));
        } else {
            setSelectedCells([...selectedCells, [row, col]]);
        }
        setMessage('');
    };

    const orderedSelection = selectedCells.slice().sort((a, b) =>
        a[0] !== b[0] ? a[0] - b[0]
            : a[1] - b[1]
    );
    const validSelection =
        orderedSelection.length > 1 && isSelectionContiguous(orderedSelection);

    const selectedWord =
        validSelection
            ? orderedSelection.map(([r, c]) => grid[r][c]).join('')
            : '';

    const handleSubmit = () => {
        if (!validSelection || !selectedWord) {
            setMessage('Select contiguous cells in a line (row/column/diagonal).');
            return;
        }
        const match = placedWords.find(pw =>
            pw.word === selectedWord &&
            !foundWords.has(pw.word)
        );
        if (match) {
            setFoundWords(prev => new Set(prev).add(selectedWord));
            setMessage(`Great! Found "${match.english}".`);
            setSelectedCells([]);
            if ((foundWords.size + 1) >= Math.min(5, placedWords.length)) {
                setGameOver(true);
                if (onTaskCompleted) onTaskCompleted(true);
            }
        } else {
            setMessage('Not a valid word, check direction and try again.');
            setSelectedCells([]);
        }
    };

    const foundCellIdx = {};
    placedWords.forEach(w => {
        if (foundWords.has(w.word)) {
            for (let k = 0; k < w.length; k++) {
                foundCellIdx[`${w.start[0] + w.direction.dr * k}-${w.start[1] + w.direction.dc * k}`] = true;
            }
        }
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-gray-900 dark:to-gray-700 flex flex-col items-center p-2 sm:p-4">
            <button onClick={onBack} className="mb-2 sm:mb-3 bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg shadow text-sm sm:text-base">
                Back to Level Select
            </button>
            <div className="max-w-5xl w-full">
                <div className="flex flex-col items-center justify-center mt-2">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white text-center">Scrabble Game &ndash; Level {selectedLevel}</h2>
                    <div className="mb-3 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-12 w-full max-w-lg">
                        <span className="text-lg sm:text-xl bg-white px-2 sm:px-4 py-1 rounded-lg shadow border border-blue-200">
                            <b>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</b> minutes left
                        </span>
                        <span className="ml-0 sm:ml-4 text-lg sm:text-xl bg-white px-2 sm:px-4 py-1 rounded-lg shadow border border-green-200">
                            Words found: <b>{foundWords.size} / {Math.min(5, placedWords.length)}</b>
                        </span>
                    </div>
                </div>
                {gameOver && (
                    <GameOverScreen
                        success={foundWords.size >= Math.min(5, placedWords.length)}
                        wordsFound={foundWords.size}
                        wordsTarget={Math.min(5, placedWords.length)}
                        onRestart={onRestart}
                        onQuit={onBack}
                    />
                )}
                <div className="flex flex-col md:flex-row items-start justify-center gap-4 sm:gap-12 mt-2 w-full">
                    <div className="bg-white p-2 sm:p-6 rounded-xl shadow-xl w-full md:w-auto overflow-x-auto">
                        <div
                            className="grid gap-1 sm:gap-2"
                            style={{
                                gridTemplateColumns: `repeat(${gridSize}, minmax(2.2rem, 3rem))`
                            }}
                        >
                            {grid.map((rowArr, row) => rowArr.map((letter, col) => {
                                const isSelected = selectedCells.some(([r, c]) => r === row && c === col);
                                const isFound = foundCellIdx[`${row}-${col}`];
                                return (
                                    <ScrabbleCell
                                        key={`${row}-${col}`}
                                        letter={letter}
                                        cellIdx={[row, col]}
                                        selectedIdx={isSelected}
                                        foundIdx={isFound}
                                        onClick={() => !gameOver && handleCellClick(row, col)}
                                    />
                                );
                            }))}
                        </div>
                        <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row items-center">
                            <input
                                type="text"
                                readOnly
                                value={selectedWord}
                                className="w-32 sm:w-44 text-center font-mono p-2 rounded-lg bg-gray-50 border shadow mb-2 sm:mb-0"
                                placeholder="Select tiles"
                            />
                            <button
                                onClick={handleSubmit}
                                className="sm:ml-3 bg-green-600 text-white px-2 sm:px-3 py-2 rounded-lg shadow text-sm sm:text-base"
                                disabled={!validSelection || gameOver}
                            >Submit Word</button>
                            <button
                                onClick={() => setSelectedCells([])}
                                className="sm:ml-2 bg-red-600 text-white px-2 sm:px-3 py-2 rounded-lg shadow text-sm sm:text-base"
                                disabled={selectedCells.length === 0 || gameOver}
                            >Clear</button>
                        </div>
                        {message && <div className="mt-2 p-2 text-blue-800 text-sm">{message}</div>}
                    </div>
                    <div className="min-w-[180px] sm:min-w-[240px] w-full md:max-w-xs bg-white p-2 sm:p-4 rounded-xl shadow-xl">
                        <h4 className="font-bold mb-2 text-lg sm:text-xl text-gray-900 dark:text-white">Words to Find</h4>
                        <WordsToFindList placedWords={placedWords} foundWords={foundWords} />
                        <div className="mt-2 text-xs sm:text-sm text-gray-500">
                            Tap each word for an image clue. Select contiguous tiles, then Submit.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScrabbleGame;
