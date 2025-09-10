import React, { useState, useEffect } from 'react';
import ScrabbleGame from './ScrabbleGame';
import { fetchWordsByLevelAndTopic } from '../../services/api';

const GRID_SIZE = 8; // Can be adjusted based on your scrabble grid needs

const ScrabbleGameContainer = ({ onBackToGameSelection, level, topic, scenario, gameData }) => {
  const [scrabbleWords, setScrabbleWords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Automatically load scrabble words when component mounts
  useEffect(() => {
    if (level && topic) {
      loadScrabbleWords();
    }
  }, [level, topic]);

  const loadScrabbleWords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Loading scrabble words for level: ${level} and topic: ${topic}`);
      const data = await fetchWordsByLevelAndTopic(level, topic);
      
      if (!data.pairs || data.pairs.length === 0) {
        throw new Error(`No words found for level ${level} and topic ${topic}`);
      }

      // Transform vocabulary pairs to scrabble format
      const scrabbleWords = data.pairs.map(pair => ({
        german: pair.de.replace(/^(der|die|das)\s+/i, ''), // Remove articles
        english: pair.en,
        image: pair.image || null
      }));

      // Limit based on game settings or default to GRID_SIZE
      const maxWords = gameData?.maxWords ? Math.min(gameData.maxWords, 12) : GRID_SIZE;
      const minWords = gameData?.minWords ? Math.max(gameData.minWords, 4) : 4;
      const wordCount = Math.min(Math.max(scrabbleWords.length, minWords), maxWords);
      
      const limitedWords = scrabbleWords.slice(0, wordCount);
      setScrabbleWords(limitedWords);
      setGameStarted(true);
      
    } catch (err) {
      console.error('Error loading scrabble words:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultWords = () => [
    { german: 'TERMIN', english: 'Appointment', image: null },
    { german: 'GEBÜHR', english: 'Fee', image: null },
    { german: 'FORMULAR', english: 'Form', image: null },
    { german: 'AUSWEIS', english: 'ID Card', image: null },
    { german: 'PASS', english: 'Passport', image: null },
    { german: 'ANMELDUNG', english: 'Registration', image: null },
    { german: 'MIETVERTRAG', english: 'Rental Contract', image: null },
    { german: 'WOHNSITZ', english: 'Residence', image: null }
  ];

  const handleTaskCompleted = (success, wordsFound, wordsTarget) => {
    console.log(`Scrabble game completed for scenario "${scenario.name}" at level ${level}:`, success ? 'Won' : 'Lost');
    console.log(`Words found: ${wordsFound}/${wordsTarget}`);
  };

  const handleRestart = () => {
    loadScrabbleWords();
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
          <p className="text-lg text-gray-700">Loading scrabble words for {gameData?.name || 'Scrabble Game'}...</p>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load Scrabble Game</h2>
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
              onClick={loadScrabbleWords}
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

  // Scrabble game component
  if (gameStarted && scrabbleWords) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Game Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {gameData?.name || 'Scrabble Game'}
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
              <span>Words: {scrabbleWords.length}</span>
              {gameData?.timeLimit && <span>Time Limit: {gameData.timeLimit}s</span>}
              <span>Grid Size: {GRID_SIZE}x{GRID_SIZE}</span>
            </div>
          </div>
        </div>

        {/* Scrabble Game Component */}
        <ScrabbleGame
          words={scrabbleWords}
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Scrabble Game Not Ready</h2>
        <p className="text-gray-600 mb-6">Something went wrong while setting up the scrabble game.</p>
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

export default ScrabbleGameContainer;
