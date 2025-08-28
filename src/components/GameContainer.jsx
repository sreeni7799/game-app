import React, { useState } from 'react';
import GameSelector from './GameSelector';
import MemoryGameContainer from './MemoryGame/MemoryGameContainer';
import ScrabbleGameContainer from './ScrabbleGame/ScrabbleGameContainer'; // Make sure this is imported
import AnagramGameContainer from './Anagrams/AnagramContainer';

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
                    <AnagramGameContainer
                        onBackToGameSelection={handleBackToGameSelection}
                    />
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
