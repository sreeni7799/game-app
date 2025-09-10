const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Word-related functions
export const fetchWordsByLevel = async (languageLevel) => {
  try {
    console.log(`Fetching words for level: ${languageLevel}`);
    const response = await fetch(`${API_BASE_URL}/words/level/${languageLevel}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const words = await response.json();
    console.log('Successfully fetched words:', words);
    const pairs = words.map(word => ({
      de: `${word.article} ${word.germanWordSingular}`,
      en: word.englishTranslation,
      image: word.image || '📚',
      id: word._id
    }));
    return { pairs };
  } catch (error) {
    console.error('Error fetching words:', error);
    throw error;
  }
};

export const fetchWordsByLevelAndTopic = async (languageLevel, topic) => {
  try {
    console.log(`Fetching words for level: ${languageLevel} and topic: ${topic}`);
    const response = await fetch(`${API_BASE_URL}/words/level/${languageLevel}/topic/${topic}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const words = await response.json();
    console.log('Successfully fetched words:', words);
    const pairs = words.map(word => ({
      de: `${word.article} ${word.germanWordSingular}`,
      en: word.englishTranslation,
      image: word.image || '📚',
      id: word._id
    }));
    return { pairs };
  } catch (error) {
    console.error('Error fetching words by level and topic:', error);
    throw error;
  }
};

export const fetchAvailableLevels = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/words/levels`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const levels = await response.json();
    return levels;
  } catch (error) {
    console.error('Error fetching levels:', error);
    throw error;
  }
};

// Scenario and Game functions
export const fetchScenariosByLevelAndTopic = async (level, topic) => {
  try {
    console.log(`Fetching scenarios for level: ${level} and topic: ${topic}`);
    const response = await fetch(`${API_BASE_URL}/scenarios/level/${level}/topic/${topic}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const scenarios = await response.json();
    console.log('Successfully fetched scenarios:', scenarios);
    return scenarios;
  } catch (error) {
    console.error('Error fetching scenarios by level and topic:', error);
    throw error;
  }
};

export const fetchScenarioWithGames = async (scenarioId) => {
  try {
    console.log(`Fetching scenario with games for ID: ${scenarioId}`);
    const response = await fetch(`${API_BASE_URL}/scenarios/${scenarioId}/with-games`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const scenario = await response.json();
    console.log('Successfully fetched scenario with games:', scenario);
    return scenario;
  } catch (error) {
    console.error('Error fetching scenario with games:', error);
    throw error;
  }
};

export const fetchGamesForScenario = async (scenarioId) => {
  try {
    console.log(`Fetching games for scenario ID: ${scenarioId}`);
    const response = await fetch(`${API_BASE_URL}/scenarios/${scenarioId}/games`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const games = await response.json();
    console.log('Successfully fetched games for scenario:', games);
    return games;
  } catch (error) {
    console.error('Error fetching games for scenario:', error);
    throw error;
  }
};

export const fetchGameForScenarioLevel = async (scenarioId, level) => {
  try {
    console.log(`Fetching game for scenario ${scenarioId} at level: ${level}`);
    const response = await fetch(`${API_BASE_URL}/scenarios/${scenarioId}/level/${level}/game`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const gameData = await response.json();
    console.log('Successfully fetched game for level:', gameData);
    return gameData;
  } catch (error) {
    console.error('Error fetching game for scenario level:', error);
    throw error;
  }
};

export const fetchTopicsByLevel = async (level) => {
  try {
    console.log(`Fetching topics for level: ${level}`);
    const response = await fetch(`${API_BASE_URL}/topics/level/${level}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const topics = await response.json();
    console.log('Successfully fetched topics:', topics);
    return topics;
  } catch (error) {
    console.error('Error fetching topics by level:', error);
    throw error;
  }
};

export const fetchAllTopics = async () => {
  try {
    console.log('Fetching all topics');
    const response = await fetch(`${API_BASE_URL}/topics`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const topics = await response.json();
    console.log('Successfully fetched all topics:', topics);
    return topics;
  } catch (error) {
    console.error('Error fetching all topics:', error);
    throw error;
  }
};

// Accommodation function (existing)
export const fetchAccommodation = async() => {
  try {
    const response = await fetch(`${API_BASE_URL}/accommodation`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const accommodation = await response.json();
    return accommodation;
  } catch (error) {
    console.error('Error fetching the information:', error);
    throw error;
  }
};
