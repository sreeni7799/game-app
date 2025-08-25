import React, { useState } from 'react';
import ScrabbleGame from './ScrabbleGame'; // This component implements your NxN crossword/adjacency logic
import LanguageLevelSelector from './LanguageLevelSelector';
import { fetchWordsByLevel } from '../services/api';

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
            german: pair.de.replace(/^(der|die|das)\s+/i, ''), // Remove leading article if present
            english: pair.en
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
      setScrabbleWords(getDefaultWords().slice(0, GRID_SIZE));
      setGameStarted(true); // Allow fallback play
    } finally {
      setLoading(false);
    }
  };

  const getDefaultWords = () => [
    { german: 'TERMIN', english: 'Appointment' },
    { german: 'GEBÜHR', english: 'Fee' },
    { german: 'FORMULAR', english: 'Form' },
    { german: 'AUSWEIS', english: 'ID Card' },
    { german: 'PASS', english: 'Passport' },
    { german: 'ANMELDUNG', english: 'Registration' },
    { german: 'MIETVERTRAG', english: 'Rental Contract' },
    { german: 'WOHNSITZ', english: 'Residence' }
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 dark:bg-gray-900 p-8">
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-100 px-6 py-4 rounded-lg max-w-md text-center">
          <h3 className="font-bold text-lg mb-2">Error Loading Puzzle Words</h3>
          <p className="mb-4">{error}</p>
          <button
            onClick={handleBackToLevelSelect}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mr-2"
          >
            Try Again
          </button>
          <button
            onClick={() => {
              setError(null);
              setScrabbleWords(getDefaultWords().slice(0, GRID_SIZE));
              setGameStarted(true);
            }}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Use Default Words
          </button>
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
