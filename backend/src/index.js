const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Правильная CORS конфигурация для онлайн режима
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://127.0.0.1:3000',
        'https://urkaphone.vercel.app',
        'https://*.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/game', require('./routes/games'));
app.use('/api/user', require('./routes/users'));

// Test endpoints
app.get('/api/test-db', async (req, res) => {
  try {
    const { query } = require('./config/database');
    const result = await query('SELECT NOW() as current_time');
    res.json({ 
      message: 'Database connection successful!',
      time: result.rows[0].current_time
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'URKA Phone Backend API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'URKA Phone Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      game: '/api/game',
      user: '/api/user',
      testDb: '/api/test-db',
      health: '/api/health'
    }
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 CORS настроен для: localhost:3000 и urkaphone.vercel.app`);
  testConnection();
});

// WebSocket сервер для мультиплеера
require('./websocket');
console.log('🔌 WebSocket сервер запущен на порту 8080');

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  const { pool } = require('./config/database');
  await pool.end();
  server.close(() => {
    process.exit(0);
  });
});