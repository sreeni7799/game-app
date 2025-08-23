import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import wordsRouter from './routes/words.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://gabriel8891894549:PiggsRbd3gvu6XKp@cluster0.ln0ku.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/words', wordsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});