import React, { useState } from 'react';
import TabooGame from './TabooGame';
import LanguageLevelSelector from '../LanguageLevelSelector';
import { fetchWordsByLevel } from '../../services/api';

const TabooGameContainer = ({ onBackToGameSelection }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [tabooData, setTabooData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const handleLevelSelect = async (level) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedLevel(level);
      
      console.log(`Loading words for taboo game - level: ${level}`);
      const data = await fetchWordsByLevel(level);
      
      if (!data.pairs || data.pairs.length === 0) {
        throw new Error(`No words found for level ${level}`);
      }

      // Convert vocabulary pairs to taboo format
      const tabooEntries = data.pairs.map(pair => {
        // Generate taboo words from other vocabulary in the dataset
        const otherWords = data.pairs
          .filter(p => p.de !== pair.de)
          .map(p => p.de.replace(/^(der|die|das)\s+/i, ''))
          .slice(0, 3); // Take 3 related words as taboo

        return {
          word: pair.de.replace(/^(der|die|das)\s+/i, ''), // Remove articles
          english: pair.en,
          hint: `English: ${pair.en}`,
          clues: [
            `It's related to ${pair.en}`,
            `Germans use this word daily`,
            `You might find this in German conversations`
          ],
          tabooWords: otherWords.length >= 3 ? otherWords : ['German', 'word', 'language']
        };
      }).slice(0, 10); // Limit to 10 entries

      setTabooData(tabooEntries);
      setGameStarted(true);
    } catch (err) {
      console.error('Error loading taboo data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLevelSelect = () => {
    setGameStarted(false);
    setSelectedLevel(null);
    setTabooData(null);
    setError(null);
  };

  const handleGameComplete = (result) => {
    console.log(`Taboo completed for level ${selectedLevel}:`, result);
    // Auto return to level select after showing results briefly
    setTimeout(() => {
      handleBackToLevelSelect();
    }, 3000);
  };

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4">
        <div className="bg-white rounded-lg p-8 text-center shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => handleLevelSelect(selectedLevel)}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleBackToLevelSelect}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-colors"
            >
              Back to Levels
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <div className="text-xl font-semibold text-purple-800">
            Loading taboo game for level {selectedLevel}...
          </div>
        </div>
      </div>
    );
  }

  // Game started
  if (gameStarted && tabooData) {
    return (
      <TabooGame
        entries={tabooData}
        level={selectedLevel}
        onBack={handleBackToLevelSelect}
        onComplete={handleGameComplete}
      />
    );
  }

  // Level selection
  return (
    <LanguageLevelSelector
      onLevelSelect={handleLevelSelect}
      onBackToGameSelection={onBackToGameSelection}
    />
  );
};

export default TabooGameContainer;
