const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchWordsByLevel = async (languageLevel) => {
  try {
    console.log(`Fetching words for level: ${languageLevel}`);
    const response = await fetch(`${API_BASE_URL}/words/level/${languageLevel}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const words = await response.json();
    console.log('Successfully fetched words:', words);
    
    // Transform MongoDB words to memory game format
    const pairs = words.map(word => ({
      de: `${word.article} ${word.germanWordSingular}`,
      en: word.englishTranslation,
      image: word.image || '📚', // Default emoji if no image
      id: word._id
    }));

    return { pairs };
  } catch (error) {
    console.error('Error fetching words:', error);
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