import React, { useState, useEffect } from 'react';
import QuizGame from './QuizGame';
import { fetchWordsByLevelAndTopic } from '../../services/api';

const QuizGameContainer = ({ onBackToGameSelection, level, topic, scenario, gameData }) => {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Automatically load quiz questions when component mounts
  useEffect(() => {
    if (level && topic) {
      loadQuizData();
    }
  }, [level, topic]);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Loading quiz questions for level: ${level} and topic: ${topic}`);
      const data = await fetchWordsByLevelAndTopic(level, topic);
      
      if (!data.pairs || data.pairs.length === 0) {
        throw new Error(`No words found for level ${level} and topic ${topic}`);
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
          choices: shuffleArray([pair.en, ...otherOptions]),
          germanWord: pair.de,
          image: pair.image
        };
      });

      // Limit questions based on game settings or default to 10
      const maxQuestions = gameData?.maxWords ? Math.min(gameData.maxWords, 15) : 10;
      const minQuestions = gameData?.minWords ? Math.max(gameData.minWords, 5) : 5;
      const questionCount = Math.min(Math.max(questions.length, minQuestions), maxQuestions);
      
      const limitedQuestions = questions.slice(0, questionCount);
      setQuizData(limitedQuestions);
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

  const handleTaskCompleted = (success, score) => {
    console.log(`Quiz completed for scenario "${scenario.name}" at level ${level}:`, success ? 'Passed' : 'Failed');
    console.log(`Score: ${score}/${quizData.length}`);
  };

  const handleRestart = () => {
    loadQuizData();
  };

  const handleBackToScenarios = () => {
    if (onBackToGameSelection) {
      onBackToGameSelection();
    }
  };

  // Loading state while fetching questions
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading quiz questions for {gameData?.name || 'Quiz Game'}...</p>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load Quiz</h2>
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
              onClick={loadQuizData}
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

  // Quiz game component
  if (gameStarted && quizData) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Game Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {gameData?.name || 'Quiz Game'}
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
              <span>Questions: {quizData.length}</span>
              {gameData?.timeLimit && <span>Time Limit: {gameData.timeLimit}s</span>}
              <span>Topic: {topic}</span>
            </div>
          </div>
        </div>

        {/* Quiz Game Component */}
        <QuizGame
          questions={quizData}
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz Not Ready</h2>
        <p className="text-gray-600 mb-6">Something went wrong while setting up the quiz.</p>
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

export default QuizGameContainer;
