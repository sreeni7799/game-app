import React, { useState } from 'react';
import GameSelector from './GameSelector';
import MemoryGameContainer from './MemoryGameContainer';
import ScrabbleGameContainer from './ScrabbleGameContainer'; // Make sure this is imported

const GameContainer = () => {
  const [selectedGame, setSelectedGame] = useState(null);

  const handleGameSelect = (game) => {
    console.log(`Selected game: ${game.name}`);
    setSelectedGame(game.id);
  };

  const handleBackToGameSelection = () => {
    setSelectedGame(null);
  };

  const renderGame = () => {
    switch (selectedGame) {
      case 'memory':
        return (
          <MemoryGameContainer 
            onBackToGameSelection={handleBackToGameSelection}
          />
        );
      case 'scrabble':
        return (
          <ScrabbleGameContainer 
            onBackToGameSelection={handleBackToGameSelection}
          />
        );
      case 'quiz':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Quiz Coming Soon!</h2>
              <button
                onClick={handleBackToGameSelection}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
              >
                Back to Game Selection
              </button>
            </div>
          </div>
        );
      case 'taboo':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Taboo Coming Soon!</h2>
              <button
                onClick={handleBackToGameSelection}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
              >
                Back to Game Selection
              </button>
            </div>
          </div>
        );
      case 'anagrams':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Anagrams Coming Soon!</h2>
              <button
                onClick={handleBackToGameSelection}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
              >
                Back to Game Selection
              </button>
            </div>
          </div>
        );
      default:
        return <GameSelector onGameSelect={handleGameSelect} />;
    }
  };

  return (
    <div className="App">
      {renderGame()}
    </div>
  );
};

export default GameContainer;
