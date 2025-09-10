import React, { useState, useEffect } from 'react';
import AnagramGame from './AnagramGame';
import { fetchWordsByLevelAndTopic } from '../../services/api';

const AnagramGameContainer = ({ onBackToGameSelection, level, topic, scenario, gameData }) => {
  const [anagramWords, setAnagramWords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Automatically load anagram words when component mounts
  useEffect(() => {
    if (level && topic) {
      loadAnagramWords();
    }
  }, [level, topic]);

  const loadAnagramWords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Loading anagram words for level: ${level} and topic: ${topic}`);
      const data = await fetchWordsByLevelAndTopic(level, topic);
      
      if (!data.pairs || data.pairs.length === 0) {
        throw new Error(`No words found for level ${level} and topic ${topic}`);
      }

      // Format words for anagram game - remove articles from German words
      const formattedWords = data.pairs
        .filter(word => {
          const germanWord = word.de;
          const englishWord = word.en;
          return germanWord && englishWord;
        })
        .map(word => ({
          germanWord: word.de.replace(/^(der|die|das)\s+/i, ''),
          english: word.en,
          category: 'General',
          image: word.image || null
        }));

      // Limit based on game settings or default to 8 words
      const maxWords = gameData?.maxWords ? Math.min(gameData.maxWords, 10) : 8;
      const minWords = gameData?.minWords ? Math.max(gameData.minWords, 4) : 4;
      const wordCount = Math.min(Math.max(formattedWords.length, minWords), maxWords);
      
      const limitedWords = formattedWords.slice(0, wordCount);
      setAnagramWords(limitedWords);
      setGameStarted(true);
      
    } catch (err) {
      console.error('Error loading anagram words:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCompleted = (success, completedWords, totalWords) => {
    console.log(`Anagram game completed for scenario "${scenario.name}" at level ${level}:`, success ? 'Passed' : 'Failed');
    console.log(`Completed: ${completedWords}/${totalWords} words`);
  };

  const handleRestart = () => {
    loadAnagramWords();
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
          <p className="text-lg text-gray-700">Loading anagram words for {gameData?.name || 'Anagram Game'}...</p>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load Anagram Game</h2>
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
              onClick={loadAnagramWords}
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

  // Anagram game component
  if (gameStarted && anagramWords) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Game Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {gameData?.name || 'Anagram Game'}
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
              <span>Words: {anagramWords.length}</span>
              {gameData?.timeLimit && <span>Time Limit: {gameData.timeLimit}s</span>}
              <span>Topic: {topic}</span>
            </div>
          </div>
        </div>

        {/* Anagram Game Component */}
        <AnagramGame
          words={anagramWords}
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Anagram Game Not Ready</h2>
        <p className="text-gray-600 mb-6">Something went wrong while setting up the anagram game.</p>
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

export default AnagramGameContainer;
