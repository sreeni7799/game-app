import express from 'express';
import { Word } from '../models/Word.js';

const router = express.Router();

// Get words by language level
router.get('/level/:level', async (req, res) => {
  try {
    const { level } = req.params;
    
    // Validate level
    const validLevels = ['A1', 'A2', 'B1', 'B2'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({ error: 'Invalid language level' });
    }

    // Fetch words for the specified level
    const words = await Word.find({ 
      languageLevel: level,
      englishTranslation: { $ne: '' } // Only words with English translations
    })
    .select('germanWordSingular article englishTranslation image _id')
    .limit(20) // Limit results for performance
    .lean();

    if (words.length === 0) {
      return res.status(404).json({ error: `No words found for level ${level}` });
    }

    res.json(words);
  } catch (error) {
    console.error('Error fetching words by level:', error);
    res.status(500).json({ error: 'Failed to fetch words' });
  }
});

// Get available levels
router.get('/levels', async (req, res) => {
  try {
    const levels = await Word.distinct('languageLevel');
    const sortedLevels = levels.sort((a, b) => {
      const levelOrder = ['A1', 'A2', 'B1', 'B2'];
      return levelOrder.indexOf(a) - levelOrder.indexOf(b);
    });
    
    res.json(sortedLevels);
  } catch (error) {
    console.error('Error fetching available levels:', error);
    res.status(500).json({ error: 'Failed to fetch levels' });
  }
});

export default router;