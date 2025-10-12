const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Простая CORS конфигурация
app.use(cors());
app.use(express.json());

// Простые тестовые роуты
app.get('/api/test-db', (req, res) => {
  res.json({ 
    message: 'Database connection successful! (mock)',
    time: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'URKA Phone Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Мок-авторизация
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  
  // Простая валидация
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
  }
  
  // Мок-ответ
  res.json({ 
    message: 'Регистрация успешна!',
    user: { 
      id: Math.floor(Math.random() * 1000), 
      username,
      email 
    },
    token: 'mock-jwt-token-' + Date.now()
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Введите имя пользователя и пароль' });
  }
  
  // Мок-ответ (всегда успешный)
  res.json({ 
    message: 'Вход выполнен!',
    user: { 
      id: 1, 
      username,
      email: username + '@example.com'
    },
    token: 'mock-jwt-token-' + Date.now()
  });
});

// Мок-игры
app.post('/api/game/create', (req, res) => {
  res.json({ 
    gameId: 'game-' + Date.now(),
    players: [req.body.host],
    status: 'waiting'
  });
});

app.get('/api/game/active-rooms', (req, res) => {
  res.json([
    { id: 'room-1', name: 'Комната Алексея', players: 2, maxPlayers: 4 },
    { id: 'room-2', name: 'Игра с друзьями', players: 3, maxPlayers: 6 }
  ]);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API доступен по: http://localhost:${PORT}/api`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});