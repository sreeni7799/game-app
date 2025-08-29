import React, { useState } from 'react';
import MemoryGame from './MemoryGame';
import LanguageLevelSelector from '../LanguageLevelSelector';
import { fetchWordsByLevel } from '../../services/api';

const MemoryGameContainer = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [memoryPairs, setMemoryPairs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const handleLevelSelect = async (level) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedLevel(level);
      
      console.log(`Loading words for level: ${level}`);
      const data = await fetchWordsByLevel(level);
      
      if (!data.pairs || data.pairs.length === 0) {
        throw new Error(`No words found for level ${level}`);
      }

      // Limit to maximum 8 pairs (16 cards) for optimal gameplay
      const limitedPairs = data.pairs.slice(0, 8);
      
      setMemoryPairs({ pairs: limitedPairs });
      setGameStarted(true);
    } catch (err) {
      console.error('Error loading words:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLevelSelect = () => {
    setGameStarted(false);
    setSelectedLevel(null);
    setMemoryPairs(null);
    setError(null);
  };

  const handleTaskCompleted = (success) => {
    console.log(`Game completed for level ${selectedLevel}:`, success ? 'Won' : 'Lost');
    
    if (success) {
      console.log('Congratulations! Consider trying the next level.');
    }
  };

  const handleRestart = () => {
    if (selectedLevel) {
      handleLevelSelect(selectedLevel);
    }
  };

  // Loading state while fetching words
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-2xl font-semibold">Loading {selectedLevel} words...</div>
          <div className="text-lg opacity-75 mt-2">Preparing your memory game</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-pink-500 to-purple-500 flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <h2 className="text-3xl font-bold mb-4">⚠️ Oops!</h2>
          <p className="text-lg mb-4">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => selectedLevel ? handleLevelSelect(selectedLevel) : setError(null)} 
              className="w-full bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={handleBackToLevelSelect} 
              className="w-full bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-red-600 transition-colors"
            >
              Back to Level Select
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show level selector if no level chosen or game not started
  if (!gameStarted) {
    return <LanguageLevelSelector onLevelSelect={handleLevelSelect} />;
  }

  // Show memory game
  return (
    <MemoryGame
      memoryPairs={memoryPairs}
      moveLimit={30}
      timeLimit={90}
      onTaskCompleted={handleTaskCompleted}
      onBackToLevelSelect={handleBackToLevelSelect}
      selectedLevel={selectedLevel}
      onRestart={handleRestart}
    />
  );
};

export default MemoryGameContainer;