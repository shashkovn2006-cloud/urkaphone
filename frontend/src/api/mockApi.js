// Временная мок-версия API для демонстрации на Vercel
const mockApi = {
  register: (userData) => {
    console.log('📝 Mock register:', userData);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Имитация проверки данных
        if (!userData.username || !userData.email || !userData.password) {
          reject(new Error('Все поля обязательны для заполнения'));
          return;
        }
        
        if (userData.password.length < 6) {
          reject(new Error('Пароль должен содержать минимум 6 символов'));
          return;
        }
        
        resolve({ 
          data: { 
            message: 'Регистрация успешна!',
            token: 'mock-jwt-token-' + Date.now(),
            user: { 
              id: Math.floor(Math.random() * 1000), 
              username: userData.username,
              email: userData.email
            }
          } 
        });
      }, 1500);
    });
  },
  
  login: (userData) => {
    console.log('🔐 Mock login:', userData);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Демо-логин: любой пароль работает
        if (!userData.username || !userData.password) {
          reject(new Error('Введите имя пользователя и пароль'));
          return;
        }
        
        resolve({ 
          data: { 
            message: 'Вход выполнен!',
            token: 'mock-jwt-token-' + Date.now(),
            user: { 
              id: 1, 
              username: userData.username,
              email: userData.username + '@example.com'
            }
          } 
        });
      }, 1500);
    });
  },
  
  // Дополнительные мок-функции для игры
  createGame: (gameData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          data: { 
            gameId: 'game-' + Date.now(),
            players: [gameData.host],
            status: 'waiting'
          } 
        });
      }, 1000);
    });
  },
  
  getActiveRooms: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          data: [
            { id: 'room-1', name: 'Комната Алексея', players: 2, maxPlayers: 4 },
            { id: 'room-2', name: 'Игра с друзьями', players: 3, maxPlayers: 6 }
          ] 
        });
      }, 500);
    });
  }
};

export default mockApi;