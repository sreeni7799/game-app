import React, { useState } from 'react';
import AnagramGame from './AnagramGame';
import LanguageLevelSelector from '../LanguageLevelSelector';
import { fetchWordsByLevel } from '../../services/api';
import GameOverScreen from '../ScrabbleGame/ScrabbleGame'; // Import Scrabble's GameOverScreen

const AnagramGameContainer = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [anagramWords, setAnagramWords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const fallbackWords = [
    { germanWord: 'Haus', english: 'House', category: 'Accomodation', image: 'https://res.cloudinary.com/dyhvazz7u/image/upload/v1755872283/pkspqqadomfqgpzanlga.jpg' },
    { germanWord: 'Wohnung', english: 'Apartment', category: 'Accomodation', image: null },
    // ...add more fallback words as needed
  ];

  const handleLevelSelect = async (level) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedLevel(level);

      console.log(`Loading words for anagram game - level: ${level}`);
      const data = await fetchWordsByLevel(level);

      if (!data || data.length === 0) {
        throw new Error(`No words found for level ${level}`)
      }

      // Support both array and object with pairs
      const wordsArray = Array.isArray(data)
        ? data
        : Array.isArray(data.pairs)
          ? data.pairs
          : [];
        console.log(wordsArray)
      if (!wordsArray || wordsArray.length === 0) {
        throw new Error(`No words found for level ${level}`);
      }

      // Filter and format words for anagram game
      const formattedWords = wordsArray
        .filter(word => (word.germanWordSingular || word.german) && (word.englishTranslation || word.english))
        .slice(0, 8)
        .map(word => ({
          germanWord: word.germanWordSingular || word.german,
          english: word.englishTranslation || word.english,
          category: word.category || 'health',
          image: word.image || null
        }));

        console.log(formattedWords  )

      if (formattedWords.length === 0) {
        setAnagramWords(fallbackWords.slice(0, 8));
        setGameStarted(true);
        return;
      }

      setAnagramWords(formattedWords);
      setGameStarted(true);
    } catch (err) {
      console.error('Error loading words:', err);
      setError(`Failed to load words: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGameComplete = (success, completedWords, totalWords) => {
    setGameCompleted(true);
    setGameResult({
      success,
      completedWords,
      totalWords,
      score: completedWords * (success ? 3 : 2)
    });
  };

  const handleRestart = () => {
    setGameCompleted(false);
    setGameResult(null);
    if (selectedLevel) {
      handleLevelSelect(selectedLevel);
    }
  };

  const handleBackToLevels = () => {
    setError(null);
    setGameStarted(false);
    setGameCompleted(false);
    setSelectedLevel(null);
    setAnagramWords(null);
    setGameResult(null);
  };

  // Scrabble-style error UI
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-pink-500 to-purple-500 flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <h2 className="text-3xl font-bold mb-4">⚠️ Oops!</h2>
          <p className="text-lg mb-4">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={handleRestart} 
              className="w-full bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={handleBackToLevels} 
              className="w-full bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-red-600 transition-colors"
            >
              Back to Levels
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <div className="text-xl font-semibold text-purple-800">
            Loading anagram words for level {selectedLevel}...
          </div>
        </div>
      </div>
    );
  }

  // Scrabble-style Game Over Screen
  if (gameCompleted && gameResult) {
    return (
      <GameOverScreen
        success={gameResult.success}
        wordsFound={gameResult.completedWords}
        wordsTarget={gameResult.totalWords}
        onRestart={handleRestart}
        onQuit={handleBackToLevels}
      />
    );
  }

  // Show game
  if (gameStarted && anagramWords) {
    return (
      <AnagramGame
        words={anagramWords}
        level={selectedLevel}
        onBack={handleBackToLevels}
        onComplete={handleGameComplete}
      />
    );
  }

  // Show level selection
  return (
    <LanguageLevelSelector onLevelSelect={handleLevelSelect} />
  );
};

export default AnagramGameContainer;
