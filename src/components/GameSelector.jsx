import React, { useState } from 'react';

const GAMES = [
  { id: 'memory', name: 'Memory Game', emoji: '🧠', description: 'Match German words with their English translations' },
  { id: 'scrabble', name: 'Scrabble', emoji: '🔠', description: 'Form words from a set of letters for points' },
  { id: 'quiz', name: 'Quiz', emoji: '❓', description: 'Test your vocabulary with multiple-choice questions' },
  { id: 'taboo', name: 'Taboo', emoji: '🚫', description: 'Describe a word without using forbidden terms' },
  { id: 'anagrams', name: 'Anagrams', emoji: '🔤', description: 'Unscramble the letters to find the correct word' }
];

const GAME_COLORS = {
  'memory': 'from-blue-400 to-blue-700',
  'scrabble': 'from-green-400 to-green-700',
  'quiz': 'from-yellow-400 to-yellow-700',
  'taboo': 'from-purple-400 to-purple-700',
  'anagrams': 'from-pink-400 to-pink-700'
};

const GameSelector = ({ onGameSelect }) => {
  const [selectedGame, setSelectedGame] = useState(null);

  const handleGameSelect = (game) => {
    setSelectedGame(game.id);
    if (typeof onGameSelect === 'function') onGameSelect(game);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-300 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">Choose a Game</h1>
          <p className="text-lg text-gray-500 dark:text-gray-300">Select one of the available games to begin practicing!</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {GAMES.map(game => (
            <button
              key={game.id}
              onClick={() => handleGameSelect(game)}
              className={
                `p-8 rounded-2xl font-bold flex flex-col items-center shadow-lg 
                 transition-all duration-200 bg-gradient-to-br ${GAME_COLORS[game.id]}
                 text-white hover:scale-105 focus:scale-105 focus:outline-none
                 ${selectedGame === game.id ? 'ring-4 ring-white ring-offset-2' : ''}`
              }
            >
              <span className="text-5xl mb-2">{game.emoji}</span>
              <span className="text-2xl mb-2">{game.name}</span>
              <span className="font-normal opacity-90 text-base text-center">{game.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameSelector;
