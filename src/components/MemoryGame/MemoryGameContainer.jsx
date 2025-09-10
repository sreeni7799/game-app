import React, { useState, useEffect } from 'react';
import MemoryGame from './MemoryGame';
import { fetchWordsByLevelAndTopic } from '../../services/api';

const MemoryGameContainer = ({ onBackToGameSelection, level, topic, scenario, gameData }) => {
  const [memoryPairs, setMemoryPairs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Automatically load words when component mounts
  useEffect(() => {
    if (level && topic) {
      loadWordsForGame();
    }
  }, [level, topic]);

  const loadWordsForGame = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Loading words for level: ${level} and topic: ${topic}`);
      const data = await fetchWordsByLevelAndTopic(level, topic);
      
      if (!data.pairs || data.pairs.length === 0) {
        throw new Error(`No words found for level ${level} and topic ${topic}`);
      }

      // Limit based on game settings or default to 8 pairs (16 cards)
      const maxPairs = gameData?.maxWords ? Math.min(gameData.maxWords, 8) : 8;
      const minPairs = gameData?.minWords ? Math.max(gameData.minWords, 4) : 4;
      const pairCount = Math.min(Math.max(data.pairs.length, minPairs), maxPairs);
      
      const limitedPairs = data.pairs.slice(0, pairCount);
      setMemoryPairs({ pairs: limitedPairs });
      setGameStarted(true);
      
    } catch (err) {
      console.error('Error loading words:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCompleted = (success) => {
    console.log(`Game completed for scenario "${scenario.name}" at level ${level}:`, success ? 'Won' : 'Lost');
    if (success) {
      console.log(`Congratulations! You completed "${scenario.name}" successfully!`);
    }
  };

  const handleRestart = () => {
    loadWordsForGame();
  };

  const handleBackToScenarios = () => {
    if (onBackToGameSelection) {
      onBackToGameSelection();
    }
  };

  // Loading state while fetching words
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading words for {gameData?.name || 'Memory Game'}...</p>
          <p className="text-sm text-gray-500 mt-2">
            Scenario: {scenario.name} | Level: {level} | Topic: {topic}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load Game</h2>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
          <div className="text-sm text-gray-600 mb-6">
            <p><strong>Scenario:</strong> {scenario.name}</p>
            <p><strong>Level:</strong> {level}</p>
            <p><strong>Topic:</strong> {topic}</p>
          </div>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={loadWordsForGame}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={handleBackToScenarios}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Scenarios
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game component
  if (gameStarted && memoryPairs) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Game Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {gameData?.name || 'Memory Game'}
                </h1>
                <p className="text-sm text-gray-600">
                  {scenario.name} | Level: {level} | Topic: {topic}
                </p>
              </div>
              <button
                onClick={handleBackToScenarios}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Scenarios
              </button>
            </div>
            
            {/* Game Instructions */}
            {gameData?.instructions && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Instructions:</strong> {gameData.instructions}
                </p>
              </div>
            )}
            
            {/* Game Info */}
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <span>Words: {memoryPairs.pairs.length}</span>
              {gameData?.timeLimit && <span>Time Limit: {gameData.timeLimit}s</span>}
              <span>Difficulty: Medium</span>
            </div>
          </div>
        </div>

        {/* Memory Game Component */}
        <MemoryGame
          memoryPairs={memoryPairs}
          onTaskCompleted={handleTaskCompleted}
          onRestart={handleRestart}
          onQuit={handleBackToScenarios}
          selectedLevel={level}
          gameData={gameData}
          scenario={scenario}
        />
      </div>
    );
  }

  // Fallback state
  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Not Ready</h2>
        <p className="text-gray-600 mb-6">Something went wrong while setting up the game.</p>
        <button 
          onClick={handleBackToScenarios}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back to Scenarios
        </button>
      </div>
    </div>
  );
};

export default MemoryGameContainer;
