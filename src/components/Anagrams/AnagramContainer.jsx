import React, { useState } from 'react';
import AnagramGame from './AnagramGame';
import LanguageLevelSelector from '../LanguageLevelSelector';
import { fetchWordsByLevel } from '../../services/api';

const AnagramGameContainer = ({ onBackToGameSelection }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [anagramWords, setAnagramWords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const fallbackWords = [
    { germanWord: 'Haus', english: 'House', category: 'Accommodation', image: null },
    { germanWord: 'Wohnung', english: 'Apartment', category: 'Accommodation', image: null },
    { germanWord: 'Schule', english: 'School', category: 'Education', image: null },
    { germanWord: 'Buch', english: 'Book', category: 'Education', image: null },
    { germanWord: 'Auto', english: 'Car', category: 'Transport', image: null },
    { germanWord: 'Zug', english: 'Train', category: 'Transport', image: null },
    { germanWord: 'Wasser', english: 'Water', category: 'Health', image: null },
    { germanWord: 'Arzt', english: 'Doctor', category: 'Health', image: null }
  ];

  const handleLevelSelect = async (level) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedLevel(level);
      
      console.log(`Loading words for anagram game - level: ${level}`);
      const data = await fetchWordsByLevel(level);
      
      if (!data) {
        throw new Error(`No data received for level ${level}`);
      }

      // Support both array and object with pairs (consistent with other games)
      let wordsArray = [];
      
      if (Array.isArray(data)) {
        wordsArray = data;
      } else if (Array.isArray(data.pairs)) {
        wordsArray = data.pairs;
      } else {
        throw new Error(`Invalid data format for level ${level}`);
      }

      if (!wordsArray || wordsArray.length === 0) {
        throw new Error(`No words found for level ${level}`);
      }

      // Format words for anagram game (consistent with your existing pattern)
      const formattedWords = wordsArray
        .filter(word => {
          const germanWord = word.germanWordSingular || word.german || word.de;
          const englishWord = word.englishTranslation || word.english || word.en;
          return germanWord && englishWord;
        })
        .slice(0, 8) // Limit to 8 words like the original design
        .map(word => ({
          germanWord: (word.germanWordSingular || word.german || word.de || '').replace(/^(der|die|das)\s+/i, ''),
          english: word.englishTranslation || word.english || word.en || '',
          category: word.category || 'General',
          image: word.image || null
        }));

      console.log('Formatted anagram words:', formattedWords);

      if (formattedWords.length === 0) {
        console.warn('No formatted words available, using fallback');
        setAnagramWords(fallbackWords.slice(0, 8));
      } else {
        setAnagramWords(formattedWords);
      }
      
      setGameStarted(true);
      
    } catch (err) {
      console.error('Error loading words:', err);
      setError(`Failed to load words: ${err.message}`);
      
      // Use fallback words on error as a last resort
      console.log('Using fallback words due to error');
      setAnagramWords(fallbackWords.slice(0, 8));
      setGameStarted(true);
      
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

  // Error state UI (consistent with other game containers)
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-300 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Game</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => handleLevelSelect(selectedLevel)}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleBackToLevels}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Back to Levels
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state UI (consistent with other game containers)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-300 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🔤</div>
          <div className="text-xl font-semibold text-pink-800">
            Loading anagram words for level {selectedLevel}...
          </div>
        </div>
      </div>
    );
  }

  // Game completion screen
  if (gameCompleted && gameResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-300 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <h2 className="text-3xl font-bold mb-4 text-pink-600">🎉 Game Complete!</h2>
          <div className="text-6xl mb-4">{gameResult.success ? '🏆' : '🔤'}</div>
          <p className="text-xl mb-4">
            You completed <span className="font-bold text-green-600">{gameResult.completedWords}</span> out of{' '}
            <span className="font-bold">{gameResult.totalWords}</span> words!
          </p>
          <p className="text-lg mb-6">
            Final Score: <span className="font-bold text-blue-600">{gameResult.score}</span> points
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRestart}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={handleBackToLevels}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Back to Levels
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game started - render the actual game
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

  // Default: Show level selector
  return (
    <LanguageLevelSelector
      onLevelSelect={handleLevelSelect}
      onBackToGameSelection={onBackToGameSelection}
    />
  );
};

export default AnagramGameContainer;
