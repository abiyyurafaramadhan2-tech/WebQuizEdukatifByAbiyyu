// © Abiyyu Rafa Ramadhan
require('dotenv').config();

module.exports = {
  port:        parseInt(process.env.PORT || '3000'),
  jwtSecret:   process.env.JWT_SECRET || 'fallback_dev_secret_change_in_prod',
  nodeEnv:     process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  quiz: {
    questionsCount: parseInt(process.env.QUIZ_QUESTIONS_COUNT || '20'),
    timeSeconds:    parseInt(process.env.QUIZ_TIME_SECONDS    || '30'),
    streakThreshold:parseInt(process.env.QUIZ_STREAK_THRESHOLD|| '3'),
  },
  ai: {
    provider:    process.env.AI_PROVIDER || 'gemini',
    geminiKey:   process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL  || 'gemini-1.5-flash',
    openaiKey:   process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL   || 'gpt-4o-mini',
  },
};
