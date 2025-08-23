const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Word Schema to match your database structure
const wordSchema = new mongoose.Schema({
  germanWordSingular: String,
  englishTranslation: String,
  article: String,
  languageLevel: String,
  image: String,
  category: String
}, { collection: 'words' }); // Assuming your collection is named 'words'

const Word = mongoose.model('Word', wordSchema);

// Routes

// Get available language levels
app.get('/api/words/levels', async (req, res) => {
  try {
    const levels = await Word.distinct('languageLevel');
    
    if (levels.length === 0) {
      // Return default levels if no data found
      return res.json(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
    }
    
    // Sort levels in logical order
    const sortedLevels = levels.sort((a, b) => {
      const order = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
      return (order[a] || 999) - (order[b] || 999);
    });
    
    res.json(sortedLevels);
  } catch (error) {
    console.error('Error fetching levels:', error);
    res.status(500).json({ error: 'Failed to fetch levels' });
  }
});

// Get words by language level
app.get('/api/words/level/:level', async (req, res) => {
  try {
    const { level } = req.params;
    console.log(`Fetching words for level: ${level}`);
    
    const words = await Word.find({ 
      languageLevel: level 
    }).limit(16); // Limit to 16 words for 8 pairs max
    
    if (words.length === 0) {
      // Return sample words if no data found for this level
      const sampleWords = getSampleWordsForLevel(level);
      return res.json(sampleWords);
    }
    
    console.log(`Found ${words.length} words for level ${level}`);
    res.json(words);
  } catch (error) {
    console.error('Error fetching words by level:', error);
    res.status(500).json({ error: `Failed to fetch words for level ${req.params.level}` });
  }
});

// Legacy endpoint for backward compatibility
app.get('/api/memory-pairs', async (req, res) => {
  try {
    // Fetch words from any level, prioritizing daily needs categories
    const words = await Word.find({
      $or: [
        { category: { $regex: /daily|needs|basic|everyday/i } },
        { languageLevel: 'A1' }
      ]
    }).limit(12);

    if (words.length === 0) {
      // Return sample data if no words found
      return res.json({
        pairs: [
          { de: "das Brot", en: "bread", image: "🍞" },
          { de: "die Milch", en: "milk", image: "🥛" },
          { de: "das Wasser", en: "water", image: "💧" },
          { de: "das Haus", en: "house", image: "🏠" },
          { de: "das Auto", en: "car", image: "🚗" },
          { de: "das Telefon", en: "phone", image: "📱" }
        ]
      });
    }

    // Convert words to pairs format
    const pairs = words.slice(0, 6).map(word => ({
      de: `${word.article} ${word.germanWordSingular}`,
      en: word.englishTranslation,
      image: word.image || getDefaultEmoji(word.englishTranslation)
    }));

    res.json({ pairs });
  } catch (error) {
    console.error('Error fetching memory pairs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch vocabulary',
      pairs: []
    });
  }
});

// Helper function to get sample words for a level when database is empty
function getSampleWordsForLevel(level) {
  const sampleData = {
    'A1': [
      { germanWordSingular: 'Haus', englishTranslation: 'house', article: 'das', languageLevel: 'A1', image: '🏠' },
      { germanWordSingular: 'Auto', englishTranslation: 'car', article: 'das', languageLevel: 'A1', image: '🚗' },
      { germanWordSingular: 'Wasser', englishTranslation: 'water', article: 'das', languageLevel: 'A1', image: '💧' },
      { germanWordSingular: 'Brot', englishTranslation: 'bread', article: 'das', languageLevel: 'A1', image: '🍞' },
      { germanWordSingular: 'Milch', englishTranslation: 'milk', article: 'die', languageLevel: 'A1', image: '🥛' },
      { germanWordSingular: 'Telefon', englishTranslation: 'phone', article: 'das', languageLevel: 'A1', image: '📱' },
    ],
    'A2': [
      { germanWordSingular: 'Familie', englishTranslation: 'family', article: 'die', languageLevel: 'A2', image: '👨‍👩‍👧‍👦' },
      { germanWordSingular: 'Schule', englishTranslation: 'school', article: 'die', languageLevel: 'A2', image: '🏫' },
      { germanWordSingular: 'Arbeit', englishTranslation: 'work', article: 'die', languageLevel: 'A2', image: '💼' },
      { germanWordSingular: 'Zeit', englishTranslation: 'time', article: 'die', languageLevel: 'A2', image: '⏰' },
      { germanWordSingular: 'Geld', englishTranslation: 'money', article: 'das', languageLevel: 'A2', image: '💰' },
      { germanWordSingular: 'Stadt', englishTranslation: 'city', article: 'die', languageLevel: 'A2', image: '🏙️' },
    ]
  };
  
  return sampleData[level] || sampleData['A1'];
}

// Helper function to get default emoji based on English word
function getDefaultEmoji(englishWord) {
  const emojiMap = {
    'water': '💧', 'bread': '🍞', 'milk': '🥛', 'house': '🏠', 'car': '🚗',
    'phone': '📱', 'book': '📚', 'food': '🍽️', 'drink': '🥤', 'coffee': '☕',
    'tea': '🍵', 'apple': '🍎', 'banana': '🍌', 'dog': '🐕', 'cat': '🐱',
    'tree': '🌳', 'flower': '🌸', 'sun': '☀️', 'moon': '🌙', 'star': '⭐',
    'money': '💰', 'time': '⏰', 'work': '💼', 'school': '🏫', 'hospital': '🏥',
    'family': '👨‍👩‍👧‍👦', 'city': '🏙️'
  };
  
  return emojiMap[englishWord.toLowerCase()] || '📝';
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});