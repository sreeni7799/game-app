const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load environment variables from parent directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection with better error handling
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

// SCHEMAS
const wordSchema = new mongoose.Schema({
  germanWordSingular: String,
  englishTranslation: String,
  article: String,
  languageLevel: String,
  image: String,
  topic: String,
  category: String
}, { collection: 'words' });

const Word = mongoose.model('Word', wordSchema);

// Game schema
const gameSchema = new mongoose.Schema({
  name: String,
  displayName: String,
  description: String,
  minWords: Number,
  maxWords: Number,
  timeLimit: Number,
  instructions: String,
  isActive: Boolean,
  author: mongoose.Schema.Types.ObjectId,
}, { collection: 'games', timestamps: true });

const Game = mongoose.model('Game', gameSchema);

// Level subdocument schema
const LevelSchema = new mongoose.Schema({
  languageLevel: String,
  selectedGameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
  estimatedDuration: Number,
}, { _id: true });

// Scenario schema with levels array
const scenarioSchema = new mongoose.Schema({
  name: String,
  story: String,
  topic: String,
  sequence: Number,
  isActive: Boolean,
  estimatedDuration: Number,
  difficulty: String,
  author: mongoose.Schema.Types.ObjectId,
  mapPosition: {
    x: Number,
    y: Number
  },
  levels: [LevelSchema]
}, { collection: 'scenarios' });

const Scenario = mongoose.model('Scenario', scenarioSchema);

// MiniGames schema (for accommodation data)
const miniGamesSchema = new mongoose.Schema({
  title: String,
  location: String,
  price: String,
  deposit: String, 
  image: String,
  description: String,
  isScam: Boolean,
  redFlags: Array,
  greenFlags: Array,
}, { timestamps: true });

const miniGames = mongoose.model('MiniGames', miniGamesSchema);

// ROUTES

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Accommodation routes
app.get('/api/accommodation', async(req, res) => {
  try {
    const accommodationData = await miniGames.find();
    if (accommodationData.length === 0) {
      return res.json("");
    }
    res.json(accommodationData);
  } catch (error) {
    console.error("Error fetching Accommodation info: ", error);
    res.status(500).json({error: 'Failed to fetch accommodation data'});
  }
});

// Word routes
app.get('/api/words/levels', async (req, res) => {
  try {
    const levels = await Word.distinct('languageLevel');
    
    if (levels.length === 0) {
      return res.json(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
    }
    
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

app.get('/api/words/level/:level', async (req, res) => {
  try {
    const { level } = req.params;
    console.log(`Fetching words for level: ${level}`);
    
    const words = await Word.find({ 
      languageLevel: level 
    }).limit(16);
    
    if (words.length === 0) {
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

app.get('/api/words/level/:level/topic/:topic', async (req, res) => {
  try {
    const { level, topic } = req.params;
    console.log(`Fetching words for level: ${level} and topic: ${topic}`);

    const words = await Word.find({
      languageLevel: level,
      topic: topic  
    }).limit(20);

    if (words.length === 0) {
      return res.status(404).json({ 
        message: `No words found for level ${level} and topic ${topic}`,
        level: level,
        topic: topic,
        count: 0
      });
    }

    console.log(`Found ${words.length} words for level ${level} and topic ${topic}`);
    res.json(words);
  } catch (error) {
    console.error('Error fetching words by level and topic:', error);
    res.status(500).json({ 
      error: 'Failed to fetch words',
      message: error.message 
    });
  }
});

// Legacy memory pairs endpoint
app.get('/api/memory-pairs', async (req, res) => {
  try {
    const words = await Word.find({
      $or: [
        { category: { $regex: /daily|needs|basic|everyday/i } },
        { languageLevel: 'A1' }
      ]
    }).limit(12);

    if (words.length === 0) {
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

// Topic routes
app.get('/api/topics/level/:level', async (req, res) => {
  try {
    const { level } = req.params;
    console.log(`Fetching topics for level: ${level}`);

    const topics = await Word.distinct('topic', { languageLevel: level });
    
    if (topics.length === 0) {
      return res.json(['Daily needs', 'Accommodation', 'School', 'Health']);
    }
    
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

app.get('/api/topics', async (req, res) => {
  try {
    const topics = await Word.distinct('topic');
    
    if (topics.length === 0) {
      return res.json(['Daily needs', 'Accommodation', 'School', 'Health']);
    }
    
    res.json(topics);
  } catch (error) {
    console.error('Error fetching all topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// Scenario routes with game population
app.get('/api/scenarios/level/:level/topic/:topic', async (req, res) => {
  try {
    const { level, topic } = req.params;
    console.log(`Fetching scenarios for level: ${level} and topic: ${topic}`);

    const scenarios = await Scenario.find({
      topic: topic,
      isActive: true
    })
    .populate({
      path: 'levels.selectedGameId',
      match: { isActive: true },
      select: 'name displayName description timeLimit minWords maxWords instructions' // Removed gameType and difficulty
    })
    .sort({ sequence: 1 });

    // Filter scenarios that have levels matching the requested language level
    const filteredScenarios = scenarios.filter(scenario => 
      scenario.levels.some(lvl => lvl.languageLevel === level)
    );

    if (filteredScenarios.length === 0) {
      return res.status(404).json({ 
        message: `No scenarios found for level ${level} and topic ${topic}`,
        level: level,
        topic: topic,
        count: 0
      });
    }

    console.log(`Found ${filteredScenarios.length} scenarios for level ${level} and topic ${topic}`);
    res.json(filteredScenarios);
  } catch (error) {
    console.error('Error fetching scenarios by level and topic:', error);
    res.status(500).json({ 
      error: 'Failed to fetch scenarios',
      message: error.message 
    });
  }
});

// Get scenario with populated game information
app.get('/api/scenarios/:id/with-games', async (req, res) => {
  try {
    const scenario = await Scenario.findById(req.params.id)
      .populate({
        path: 'levels.selectedGameId',
        select: 'name displayName description timeLimit minWords maxWords instructions', // Removed gameType and difficulty
        model: 'Game'
      });

    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

    res.json(scenario);
  } catch (error) {
    console.error('Error fetching scenario with games:', error);
    res.status(500).json({ error: 'Failed to fetch scenario with games' });
  }
});

// Get all games for a specific scenario
app.get('/api/scenarios/:id/games', async (req, res) => {
  try {
    const scenario = await Scenario.findById(req.params.id)
      .populate('levels.selectedGameId');

    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

    const games = scenario.levels
      .map(level => level.selectedGameId)
      .filter(game => game !== null);

    res.json(games);
  } catch (error) {
    console.error('Error fetching games for scenario:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Get game details for a specific language level within a scenario
app.get('/api/scenarios/:scenarioId/level/:level/game', async (req, res) => {
  try {
    const { scenarioId, level } = req.params;
    
    const scenario = await Scenario.findById(scenarioId)
      .populate('levels.selectedGameId');
    
    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }
    
    const matchingLevel = scenario.levels.find(l => l.languageLevel === level);
    
    if (!matchingLevel) {
      return res.status(404).json({ 
        message: `No level ${level} found in this scenario` 
      });
    }
    
    res.json({
      level: matchingLevel.languageLevel,
      estimatedDuration: matchingLevel.estimatedDuration,
      game: matchingLevel.selectedGameId
    });
    
  } catch (error) {
    console.error('Error fetching game for level:', error);
    res.status(500).json({ error: 'Failed to fetch game for level' });
  }
});

// HELPER FUNCTIONS
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

// ERROR HANDLING
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// START SERVER
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});
