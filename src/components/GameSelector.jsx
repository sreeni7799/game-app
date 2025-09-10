import React, { useState, useEffect } from 'react';
import { fetchAllTopics, fetchScenariosByLevelAndTopic } from '../services/api';

const GameSelector = ({ onGameSelect }) => {
  const [allScenarios, setAllScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllScenarios();
  }, []);

  const fetchAllScenarios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const topics = await fetchAllTopics();
      const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      
      const allScenariosPromises = [];
      
      for (const level of levels) {
        for (const topic of topics) {
          allScenariosPromises.push(
            fetchScenariosByLevelAndTopic(level, topic).catch(err => {
              console.warn(`No scenarios for ${level}-${topic}:`, err);
              return [];
            })
          );
        }
      }
      
      const allScenariosArrays = await Promise.all(allScenariosPromises);
      const flattenedScenarios = allScenariosArrays.flat();
      const uniqueScenarios = flattenedScenarios.reduce((acc, scenario) => {
        if (!acc.find(s => s._id === scenario._id)) {
          acc.push(scenario);
        }
        return acc;
      }, []);
      
      setAllScenarios(uniqueScenarios);
    } catch (err) {
      setError('Failed to load scenarios');
      console.error('Error fetching all scenarios:', err);
      setAllScenarios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGameSelect = (scenario, level, game) => {
    const gameData = {
      scenario,
      level: level.languageLevel,
      topic: scenario.topic,
      game: game,
      estimatedDuration: level.estimatedDuration,
      gameId: game.name, // Use game.name instead of game.gameType
      gameDetails: {
        name: game.displayName || game.name,
        description: game.description,
        timeLimit: game.timeLimit,
        minWords: game.minWords,
        maxWords: game.maxWords,
        instructions: game.instructions
      }
    };
    
    console.log('Selected game data:', gameData);
    if (typeof onGameSelect === 'function') {
      onGameSelect(gameData);
    }
  };

  const getGameTypeEmoji = (gameName) => {
    const gameEmojis = {
      'memory': '🧠',
      'memorygame': '🧠',
      'scrabble': '🔠',
      'quiz': '❓',
      'taboo': '🚫',
      'anagrams': '🔤',
      'accommodation': '🏠'
    };
    return gameEmojis[gameName] || '🎮';
  };

  const getLevelColor = (languageLevel) => {
    const levelColors = {
      'A1': 'bg-green-100 text-green-800 border-green-200',
      'A2': 'bg-blue-100 text-blue-800 border-blue-200',
      'B1': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'B2': 'bg-orange-100 text-orange-800 border-orange-200',
      'C1': 'bg-red-100 text-red-800 border-red-200',
      'C2': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return levelColors[languageLevel] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTopicEmoji = (topic) => {
    const topicEmojis = {
      'Daily needs': '🛒',
      'Accommodation': '🏠',
      'School': '🎓',
      'Health': '🏥',
      'university related': '🎓',
      'work': '💼',
      'travel': '✈️'
    };
    return topicEmojis[topic] || '📚';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Loading all scenarios...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose a Learning Scenario</h2>
        <p className="text-gray-600">All available learning scenarios across different topics and levels</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <button 
            onClick={fetchAllScenarios}
            className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {allScenarios.length === 0 && !loading && !error ? (
        <div className="text-center py-8">
          <div className="text-gray-600 text-lg mb-4">No scenarios available</div>
          <button 
            onClick={fetchAllScenarios}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {allScenarios.map((scenario, index) => {
            const colors = [
              'from-blue-400 to-blue-700',
              'from-green-400 to-green-700',
              'from-purple-400 to-purple-700',
              'from-red-400 to-red-700',
              'from-yellow-400 to-yellow-700',
              'from-pink-400 to-pink-700',
              'from-indigo-400 to-indigo-700',
              'from-teal-400 to-teal-700',
              'from-orange-400 to-orange-700',
              'from-cyan-400 to-cyan-700'
            ];
            const cardColor = colors[index % colors.length];

            return (
              <div 
                key={scenario._id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className={`bg-gradient-to-r ${cardColor} p-6`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {scenario.name}
                    </h3>
                    <span className="text-2xl">
                      {getTopicEmoji(scenario.topic)}
                    </span>
                  </div>
                  <p className="text-white/90 text-sm mb-3">
                    {scenario.story}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm capitalize">
                      {scenario.topic}
                    </span>
                    <span className="text-white/80 text-sm">
                      Seq: {scenario.sequence}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Available Games:</h4>
                    <div className="space-y-3">
                      {scenario.levels.map((level, levelIndex) => {
                        if (!level.selectedGameId) return null;

                        const game = level.selectedGameId;
                        return (
                          <div
                            key={level._id || levelIndex}
                            className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-xl">
                                  {getGameTypeEmoji(game.name)}
                                </span>
                                <div>
                                  <div className="font-medium text-gray-800 text-sm">
                                    {game.displayName || game.name}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {game.description}
                                  </div>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(level.languageLevel)}`}>
                                {level.languageLevel}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <span>Duration: {level.estimatedDuration}min</span>
                                {game.timeLimit && <span>Timer: {game.timeLimit}s</span>}
                                {game.minWords && <span>Words: {game.minWords}-{game.maxWords}</span>}
                              </div>
                              <button
                                onClick={() => handleGameSelect(scenario, level, game)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                              >
                                Play
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Levels:</span>
                        <div className="flex space-x-1">
                          {[...new Set(scenario.levels.map(l => l.languageLevel))].map(level => (
                            <span key={level} className={`px-2 py-1 rounded text-xs ${getLevelColor(level)}`}>
                              {level}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-gray-500">
                        {scenario.levels.filter(l => l.selectedGameId).length} game{scenario.levels.filter(l => l.selectedGameId).length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GameSelector;
