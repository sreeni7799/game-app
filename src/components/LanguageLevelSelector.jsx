import React, { useState, useEffect } from 'react';
import { fetchAvailableLevels } from '../services/api';

const LanguageLevelSelector = ({ onLevelSelect, onBackToGameSelection }) => {
  const [levels, setLevels] = useState(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);

  useEffect(() => {
    const loadLevels = async () => {
      try {
        setLoading(true);
        const availableLevels = await fetchAvailableLevels();
        setLevels(availableLevels);
      } catch (error) {
        console.warn('Using default levels due to API error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadLevels();
  }, []);

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    onLevelSelect(level);
  };

  const levelDescriptions = {
    'A1': 'Beginner - Basic everyday expressions',
    'A2': 'Elementary - Simple sentences and common topics',
    'B1': 'Intermediate - More complex situations',
    'B2': 'Upper Intermediate - Complex texts and abstract topics',
    'C1': 'Advanced - Flexible and effective language use',
    'C2': 'Proficient - Near-native level fluency'
  };

  const levelColors = {
    'A1': 'from-green-400 to-green-600',
    'A2': 'from-blue-400 to-blue-600',
    'B1': 'from-yellow-400 to-yellow-600',
    'B2': 'from-orange-400 to-orange-600',
    'C1': 'from-red-400 to-red-600',
    'C2': 'from-purple-400 to-purple-600'
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative">
      {/* Back Button */}
      {onBackToGameSelection && (
        <button
          onClick={onBackToGameSelection}
          className="absolute top-6 left-6 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 z-10"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          <span>Back to Games</span>
        </button>
      )}

      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
            Select your German language proficiency level
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            Choose your current level to get appropriate vocabulary
          </p>
          <p className="text-md text-gray-500 dark:text-gray-400">
            Not sure about your level? Start with A1 and work your way up!
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <p className="text-xl text-gray-800 dark:text-white">Loading levels...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => handleLevelSelect(level)}
                className={`relative p-8 text-white font-bold rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-opacity-50 bg-gradient-to-br ${
                  levelColors[level] || 'from-gray-400 to-gray-600'
                } ${
                  selectedLevel === level
                    ? 'ring-4 ring-offset-4 ring-offset-gray-100 dark:ring-offset-gray-900 ring-white scale-105'
                    : ''
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <h3 className="text-3xl font-bold">
                    {level}
                  </h3>
                  <p className="font-normal text-base opacity-90 leading-relaxed">
                    {levelDescriptions[level]}
                  </p>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-10 rounded-full -ml-8 -mb-8"></div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageLevelSelector;
