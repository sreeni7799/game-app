import React, { useState, useEffect } from 'react';
import { fetchAvailableLevels } from '../services/api';

const LanguageLevelSelector = ({ onLevelSelect }) => {
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">Choose Your Level</h1>
          <p className="text-xl text-white opacity-90">Select your German language proficiency level</p>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="text-white text-2xl">Loading levels...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => handleLevelSelect(level)}
                className={`
                  bg-gradient-to-br ${levelColors[level]} 
                  hover:scale-105 transform transition-all duration-300
                  rounded-xl p-6 text-white shadow-2xl
                  border-4 border-white border-opacity-20
                  ${selectedLevel === level ? 'ring-4 ring-white' : ''}
                `}
              >
                <h3 className="text-3xl font-bold mb-2">{level}</h3>
                <p className="text-sm opacity-90 leading-relaxed">
                  {levelDescriptions[level]}
                </p>
                <div className="mt-4">
                  <span className="inline-block bg-white bg-opacity-20 rounded-full px-4 py-2 text-sm font-semibold">
                    Start Game →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-white opacity-75">
            Not sure about your level? Start with A1 and work your way up!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageLevelSelector;