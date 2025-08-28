import React, { useState } from 'react';
import ScrabbleGame from './ScrabbleGame'; // This component implements your NxN crossword/adjacency logic
import LanguageLevelSelector from '../LanguageLevelSelector';
import { fetchWordsByLevel } from '../../services/api';

const GRID_SIZE = 8; // Change to desired NxN size, e.g. 10 for 10x10 grid

const ScrabbleGameContainer = ({ onBackToGameSelection }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [scrabbleWords, setScrabbleWords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Handles German level selection and word fetching
  const handleLevelSelect = async (level) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedLevel(level);
      const data = await fetchWordsByLevel(level);

      if (!data || data.length === 0) {
        throw new Error(`No words found for level ${level}`);
      }

      // API pairs structure (MemoryGame style)
      let words;
      if (Array.isArray(data.pairs)) {
        words = data.pairs
          .map(pair => ({
            german: pair.de.replace(/^(der|die|das)\s+/i, ''),
            english: pair.en,
            image: pair.image // <-- Add this line
          }))
          .slice(0, GRID_SIZE); // Limit the number to grid size if needed
      } else if (Array.isArray(data)) {
        words = data
          .map(word => ({
            german: word.germanWordSingular || word.german || '',
            english: word.englishTranslation || word.english || ''
          }))
          .filter(word => word.german)
          .slice(0, GRID_SIZE);
      } else {
        words = [];
      }

      // Fallback if nothing found
      if (!words || words.length === 0) {
        words = getDefaultWords().slice(0, GRID_SIZE);
      }

      setScrabbleWords(words);
      setGameStarted(true);
    } catch (err) {
      setError(err.message || 'Error loading words for Scrabble.');
    //   setScrabbleWords(getDefaultWords().slice(0, GRID_SIZE));
    //   setGameStarted(true); // Allow fallback play
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

  const handleBackToLevelSelect = () => {
    setGameStarted(false);
    setSelectedLevel(null);
    setScrabbleWords(null);
    setError(null);
  };

  const handleTaskCompleted = (success) => {
    // You can use this callback to increment points, display feedback, etc.
    console.log(`Scrabble game completed for level ${selectedLevel}:`, success ? 'Won' : 'Lost');
  };

  const handleRestart = () => {
    if (selectedLevel) {
      handleLevelSelect(selectedLevel);
    }
  };

  // UI states:
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-800 dark:text-white">Loading puzzle for level {selectedLevel}...</p>
        </div>
      </div>
    );
  }

  if (error && !scrabbleWords) {
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

  if (gameStarted && scrabbleWords) {
    return (
      <ScrabbleGame
        words={scrabbleWords}
        gridSize={GRID_SIZE}
        onTaskCompleted={handleTaskCompleted}
        onRestart={handleRestart}
        selectedLevel={selectedLevel}
        onBack={handleBackToLevelSelect}
      />
    );
  }

  // Show level selector by default
  return (
    <LanguageLevelSelector 
      onLevelSelect={handleLevelSelect}
      onBackToGameSelection={onBackToGameSelection}
    />
  );
};

export default ScrabbleGameContainer;
