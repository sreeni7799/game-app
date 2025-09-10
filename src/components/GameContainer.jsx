import React, { useState } from 'react';
import GameSelector from './GameSelector';
import MemoryGameContainer from './MemoryGame/MemoryGameContainer';
import ScrabbleGameContainer from './ScrabbleGame/ScrabbleGameContainer';
import AnagramGameContainer from './Anagrams/AnagramContainer';
import AccommodationSwipeGameContainer from './FindingAccomodationGame/AccommodationSwipeGameContainer';
import QuizGameContainer from './QuizGame/QuizGameContainer';
import TabooGameContainer from './TabooGame/TabooGameContainer';

const GameContainer = () => {
  const [selectedGame, setSelectedGame] = useState(null);

  const handleGameSelect = (gameData) => {
    console.log('Selected game data:', gameData);
    setSelectedGame(gameData);
  };

  const handleBackToGameSelection = () => {
    setSelectedGame(null);
  };

  const renderGame = () => {
    if (!selectedGame) return null;

    const gameType = selectedGame.gameId; // This will now be game.name
    const commonProps = {
      onBackToGameSelection: handleBackToGameSelection,
      level: selectedGame.level,
      topic: selectedGame.topic,
      scenario: selectedGame.scenario,
      gameData: selectedGame.gameDetails
    };

    switch (gameType) {
      case 'memory':
      case 'memorygame':
        return <MemoryGameContainer {...commonProps} />;
      case 'scrabble':
        return <ScrabbleGameContainer {...commonProps} />;
      case 'quiz':
        return <QuizGameContainer {...commonProps} />;
      case 'taboo':
        return <TabooGameContainer {...commonProps} />;
      case 'anagram':
        return <AnagramGameContainer {...commonProps} />;
      case 'accomodation':
        return <AccommodationSwipeGameContainer {...commonProps} />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Game type "{gameType}" not supported</p>
            <button 
              onClick={handleBackToGameSelection}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Game Selection
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!selectedGame ? (
        <GameSelector onGameSelect={handleGameSelect} />
      ) : (
        renderGame()
      )}
    </div>
  );
};

export default GameContainer;
