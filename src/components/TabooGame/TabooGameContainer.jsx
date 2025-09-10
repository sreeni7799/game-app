import React, { useState, useEffect } from 'react';
import TabooGame from './TabooGame';
import { fetchWordsByLevelAndTopic } from '../../services/api';

const TabooGameContainer = ({ onBackToGameSelection, level, topic, scenario, gameData }) => {
  const [tabooEntries, setTabooEntries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Automatically load taboo entries when component mounts
  useEffect(() => {
    if (level && topic) {
      loadTabooEntries();
    }
  }, [level, topic]);

  const loadTabooEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Loading taboo entries for level: ${level} and topic: ${topic}`);
      const data = await fetchWordsByLevelAndTopic(level, topic);
      
      if (!data.pairs || data.pairs.length === 0) {
        throw new Error(`No words found for level ${level} and topic ${topic}`);
      }

      // Convert vocabulary pairs to taboo format
      const tabooEntries = data.pairs.map(pair => {
        // Generate forbidden words from other vocabulary in the dataset
        const otherWords = data.pairs
          .filter(p => p.de !== pair.de)
          .map(p => p.de.replace(/^(der|die|das)\s+/i, ''))
          .slice(0, 3); // Take 3 related words as forbidden

        return {
          word: pair.de.replace(/^(der|die|das)\s+/i, ''), // Remove articles
          english: pair.en,
          hint: `English: ${pair.en}`,
          clues: [
            `It's related to ${pair.en}`,
            `Germans use this word daily`,
            `You might find this in German conversations about ${topic}`
          ],
          tabooWords: otherWords.length >= 3 ? otherWords : ['German', 'word', 'language']
        };
      });

      // Limit based on game settings or default to 10 entries
      const maxEntries = gameData?.maxWords ? Math.min(gameData.maxWords, 15) : 10;
      const minEntries = gameData?.minWords ? Math.max(gameData.minWords, 5) : 5;
      const entryCount = Math.min(Math.max(tabooEntries.length, minEntries), maxEntries);
      
      const limitedEntries = tabooEntries.slice(0, entryCount);
      setTabooEntries(limitedEntries);
      setGameStarted(true);
      
    } catch (err) {
      console.error('Error loading taboo entries:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCompleted = (result) => {
    console.log(`Taboo game completed for scenario "${scenario.name}" at level ${level}:`, result);
    console.log(`Score: ${result.score}/${result.total * 2} points (${result.percentage}%)`);
  };

  const handleRestart = () => {
    loadTabooEntries();
  };

  const handleBackToScenarios = () => {
    if (onBackToGameSelection) {
      onBackToGameSelection();
    }
  };

  // Loading state while fetching entries
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading taboo entries for {gameData?.name || 'Taboo Game'}...</p>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load Taboo Game</h2>
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
              onClick={loadTabooEntries}
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

  // Taboo game component
  if (gameStarted && tabooEntries) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Game Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {gameData?.name || 'Taboo Game'}
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
              <span>Entries: {tabooEntries.length}</span>
              {gameData?.timeLimit && <span>Time per round: {gameData.timeLimit}s</span>}
              <span>Topic: {topic}</span>
            </div>
          </div>
        </div>

        {/* Taboo Game Component */}
        <TabooGame
          entries={tabooEntries}
          level={level}
          onBack={handleBackToScenarios}
          onComplete={handleTaskCompleted}
          onRestart={handleRestart}
          scenario={scenario}
          gameData={gameData}
        />
      </div>
    );
  }

  // Fallback state
  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Taboo Game Not Ready</h2>
        <p className="text-gray-600 mb-6">Something went wrong while setting up the taboo game.</p>
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

export default TabooGameContainer;
