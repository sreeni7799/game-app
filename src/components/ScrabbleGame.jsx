import React, { useState, useEffect } from 'react';

// Utility: place words randomly (horizontal, vertical, diagonal)
function createScrabbleGrid(words, gridSize = 8) {
  const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
  const placedWords = [];

  const directions = [
    { name: 'horizontal', dr: 0, dc: 1 },
    { name: 'vertical', dr: 1, dc: 0 },
    { name: 'diagonal', dr: 1, dc: 1 }
  ];

  words.forEach(({ german, english, image = null }) => {
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
      <img src={image} alt="" className="max-w-full max-h-full rounded"/>
    </div>
  ) : null;

// Word list styled + image hover
const WordsToFindList = ({ placedWords, foundWords }) => {
  const [hoverIdx, setHoverIdx] = useState(null);
  return (
    <ul className="space-y-2">
      {placedWords.map((pw, i) => {
        const found = foundWords.has(pw.word);
        return (
          <li key={i}
            className={`
              relative group flex items-center cursor-pointer
              bg-white rounded-lg px-4 py-2 shadow border
              text-lg transition-all
              ${found ? "line-through text-green-700 opacity-70" : "text-gray-900 hover:bg-blue-50"}
            `}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <span className="flex-1">{pw.english}</span>
            {hoverIdx === i && pw.image &&
              <WordTooltip image={pw.image} />
            }
          </li>
        );
      })}
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-gray-900 dark:to-gray-700 flex flex-col items-center p-4">
      <button onClick={onBack} className="mb-3 bg-gray-600 text-white px-4 py-2 rounded-lg shadow">
        Back to Level Select
      </button>
      <div className="max-w-5xl w-full">
        <div className="flex flex-col items-center justify-center mt-2">
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Scrabble Game &ndash; Level {selectedLevel}</h2>
          <div className="mb-3 flex items-center justify-between gap-12 w-full max-w-lg">
            <span className="text-xl bg-white px-4 py-1 rounded-lg shadow border border-blue-200">
              <b>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</b> minutes left
            </span>
            <span className="ml-4 text-xl bg-white px-4 py-1 rounded-lg shadow border border-green-200">
              Words found: <b>{foundWords.size} / {Math.min(5, placedWords.length)}</b>
            </span>
          </div>
        </div>
        {gameOver &&
        <div className="bg-green-200 border border-green-600 p-4 m-2 rounded-lg shadow text-center">
          {foundWords.size >= Math.min(5, placedWords.length)
            ? <>🎉 Congratulations! You found {foundWords.size} words!</>
            : <>Time's up! Words found: {foundWords.size}. Try again.</>
          }
          <div>
            <button onClick={onRestart} className="mt-2 mx-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow">
              Restart
            </button>
            <button onClick={onBack} className="mt-2 mx-2 bg-gray-700 text-white px-4 py-2 rounded-lg shadow">
              Back to Levels
            </button>
          </div>
        </div>
        }
        <div className="flex flex-col md:flex-row items-start justify-center gap-12 mt-2 w-full">
          <div
            className="bg-white p-6 rounded-xl shadow-xl"
          >
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, 3rem)`
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
            <div className="mt-4 flex items-center">
              <input
                type="text"
                readOnly
                value={selectedWord}
                className="w-44 text-center font-mono p-2 rounded-lg bg-gray-50 border shadow"
                placeholder="Select tiles"
              />
              <button
                onClick={handleSubmit}
                className="ml-3 bg-green-600 text-white px-3 py-2 rounded-lg shadow"
                disabled={!validSelection || gameOver}
              >Submit Word</button>
              <button
                onClick={() => setSelectedCells([])}
                className="ml-2 bg-red-600 text-white px-3 py-2 rounded-lg shadow"
                disabled={selectedCells.length === 0 || gameOver}
              >Clear</button>
            </div>
            {message && <div className="mt-2 p-2 text-blue-800">{message}</div>}
          </div>
          <div className="min-w-[240px] w-full md:max-w-xs bg-white p-4 rounded-xl shadow-xl">
            <h4 className="font-bold mb-2 text-xl text-gray-900 dark:text-white">Words to Find</h4>
            <WordsToFindList placedWords={placedWords} foundWords={foundWords} />
            <div className="mt-2 text-sm text-gray-500">
              Hover each word for an image clue. Select contiguous tiles, then Submit.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrabbleGame;
