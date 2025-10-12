// Автоматическое определение URL API
const getApiBaseUrl = () => {
  // В продакшене используем Render бэкенд, в разработке - localhost
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://urkaphone-backend.onrender.com/api';
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    console.log(`🔄 API Request: ${config.method} ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Проверяем статус ответа
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP Error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    
    // Если ответ не JSON, возвращаем пустой объект
    if (!contentType || !contentType.includes('application/json')) {
      console.log('📨 Response is not JSON, returning empty object');
      return { data: {} };
    }
    
    const text = await response.text();
    console.log('📨 API Response:', text);
    
    if (!text) {
      return { data: {} };
    }
    
    const data = JSON.parse(text);
    return { data };
    
  } catch (error) {
    console.error('❌ API Error:', error);
    
    // Более информативное сообщение об ошибке
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен.');
    }
    
    throw new Error(error.message || 'Сервер не отвечает корректно. Проверьте подключение.');
  }
};

// API функции
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: userData,
  }),
  
  login: (userData) => apiRequest('/auth/login', {
    method: 'POST',
    body: userData,
  }),
};

export const gameAPI = {
  createGame: (gameData) => apiRequest('/game/create', {
    method: 'POST',
    body: gameData,
  }),
  
  getHistory: () => apiRequest('/game/history'),
  
  getActiveRooms: () => apiRequest('/game/active-rooms'),
  
  getStats: () => apiRequest('/game/stats'),
  
  testConnection: () => apiRequest('/test-db'),
};

// Экспорт для тестирования подключения
export const testConnection = () => apiRequest('/test-db');

// Экспортируем для тестирования
export { API_BASE_URL, getApiBaseUrl };

export default apiRequest;