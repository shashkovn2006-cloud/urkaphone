import React, { useState } from "react";
import "./LoginWindow.css";
import myImage from "../assets/imagregavt.png";

export default function LoginWindow({ onSwitchToRegister, onLoginSuccess, onHomeClick, onLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Имя пользователя обязательно";
    }

    if (!formData.password) {
      newErrors.password = "Пароль обязателен";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // МОК-ВХОД (временное решение для Vercel)
      console.log('🔐 Mock login for:', formData.username);
      
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            // Всегда успешный вход для демо
            const mockUser = {
              id: Math.floor(Math.random() * 1000),
              username: formData.username,
              token: 'mock-jwt-token-' + Date.now()
            };
            
            // Сохраняем в localStorage
            localStorage.setItem('token', mockUser.token);
            localStorage.setItem('user', JSON.stringify(mockUser));
            
            console.log('✅ Mock login successful');
            resolve(mockUser);
          } catch (err) {
            reject(new Error('Ошибка сохранения данных'));
          }
        }, 1500);
      });

      // Вызываем колбэк успеха если передан
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // Также вызываем onLogin если передан (для обратной совместимости)
      if (onLogin) {
        await onLogin({
          login: formData.username,
          password: formData.password
        });
      }

      // Сброс формы
      setFormData({
        username: "",
        password: ""
      });
      
      // Показываем успех
      alert('✅ Вход выполнен! Добро пожаловать в Urka Phone!');

    } catch (error) {
      setErrors({ submit: error.message || "Неверное имя пользователя или пароль" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Кнопка домой в левом верхнем углу */}
      <button 
        className="home-button"
        onClick={onHomeClick}
        disabled={isLoading}
        title="Вернуться на главную"
      >
        ← Домой
      </button>

      <div className="login-info">
        <h1>Urka Phone</h1>
        <p>Рисуйте, угадывайте и веселитесь с друзьями в многопользовательской игре!</p>
        <img src={myImage} alt="Описание" className="login-image" />
        <div className="features">
          <div className="feature">
            <span>🎮</span>
            <div>
              <h3>Веселые игры</h3>
              <p>Рисуй и угадывай</p>
            </div>
          </div>
          <div className="feature">
            <span>👥</span>
            <div>
              <h3>С друзьями</h3>
              <p>До 8 игроков</p>
            </div>
          </div>
        </div>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Войти в игру</h2>
        <p>Введите свои данные для входа</p>
        
        <label>Имя пользователя</label>
        <input 
          type="text" 
          name="username"
          placeholder="Введите имя пользователя" 
          value={formData.username}
          onChange={handleInputChange}
          className={errors.username ? "error" : ""}
          disabled={isLoading}
        />
        {errors.username && <span className="error-text">{errors.username}</span>}
        
        <label>Пароль</label>
        <input 
          type="password" 
          name="password"
          placeholder="Введите пароль" 
          value={formData.password}
          onChange={handleInputChange}
          className={errors.password ? "error" : ""}
          disabled={isLoading}
        />
        {errors.password && <span className="error-text">{errors.password}</span>}
        
        {errors.submit && <span className="error-text submit-error">{errors.submit}</span>}
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Вход..." : "Войти"}
        </button>
        
        <p className="register-hint">
          Нет аккаунта?{' '}
          <span 
            className="register-link" 
            onClick={isLoading ? undefined : onSwitchToRegister}
            style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            Зарегистрируйтесь
          </span>
        </p>
      </form>
    </div>
  );
}