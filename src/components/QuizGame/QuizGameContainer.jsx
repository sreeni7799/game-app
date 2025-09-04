import React, { useState } from 'react';
import QuizGame from './QuizGame';
import LanguageLevelSelector from '../LanguageLevelSelector';
import { fetchWordsByLevel } from '../../services/api'

const QuizGameContainer = ({ onBackToGameSelection }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const handleLevelSelect = async (level) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedLevel(level);
      
      console.log(`Loading words for quiz - level: ${level}`);
      const data = await fetchWordsByLevel(level);
      
      if (!data.pairs || data.pairs.length === 0) {
        throw new Error(`No words found for level ${level}`);
      }

      // Convert vocabulary pairs to quiz questions
      const questions = data.pairs.map(pair => {
        // Create incorrect answers by shuffling other English words
        const otherOptions = data.pairs
          .filter(p => p.en !== pair.en)
          .map(p => p.en)
          .slice(0, 3); // Take 3 random wrong answers

        return {
          question: `What is "${pair.de}" in English?`,
          correct: pair.en,
          incorrect: otherOptions,
          choices: shuffleArray([pair.en, ...otherOptions])
        };
      }).slice(0, 10); // Limit to 10 questions

      setQuizData(questions);
      setGameStarted(true);
    } catch (err) {
      console.error('Error loading quiz data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleBackToLevelSelect = () => {
    setGameStarted(false);
    setSelectedLevel(null);
    setQuizData(null);
    setError(null);
  };

  const handleGameComplete = (result) => {
    console.log(`Quiz completed for level ${selectedLevel}:`, result);
    // You could add a completion screen here
    setTimeout(() => {
      handleBackToLevelSelect();
    }, 3000);
  };

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 to-orange-100 p-4">
        <div className="bg-white rounded-lg p-8 text-center shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => handleLevelSelect(selectedLevel)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded transition-colors"
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-yellow-100 to-orange-100">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <div className="text-xl font-semibold text-yellow-800">
            Loading quiz for level {selectedLevel}...
          </div>
        </div>
      </div>
    );
  }

  // Game started
  if (gameStarted && quizData) {
    return (
      <QuizGame
        questions={quizData}
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

export default QuizGameContainer;
