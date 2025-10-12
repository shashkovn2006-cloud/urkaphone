import React, { useState, useEffect, useCallback } from "react";
import "./GuessingPage.css";
import { useAuth } from '../context/AuthContext';

export default function GuessingPage({ onBack, drawings = [], players = [], roomCode, onSubmitGuess, onComplete }) {
  const { user } = useAuth();
  const [currentGuess, setCurrentGuess] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [currentDrawingIndex, setCurrentDrawingIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [allPlayersSubmitted, setAllPlayersSubmitted] = useState(false);

  // Проверяем, все ли игроки отправили догадки
  const checkAllPlayersSubmitted = useCallback(() => {
    const submittedCount = players.filter(player => 
      player.userid === user?.userid ? submitted : player.status === 'submitted'
    ).length;
    
    return submittedCount === players.length;
  }, [players, submitted, user]);

  // Обновляем текущий рисунок
  useEffect(() => {
    if (drawings.length > 0 && currentDrawingIndex < drawings.length) {
      setCurrentDrawing(drawings[currentDrawingIndex]);
      setCurrentGuess("");
      setSubmitted(false);
      setShowHint(false);
      setTimeLeft(45);
      setAllPlayersSubmitted(false);
    }
  }, [currentDrawingIndex, drawings]);

  // Проверяем статус всех игроков
  useEffect(() => {
    if (players.length > 0 && currentDrawing) {
      const allSubmitted = checkAllPlayersSubmitted();
      setAllPlayersSubmitted(allSubmitted);
      
      // Если все отправили - переходим к следующему рисунку через 2 секунды
      if (allSubmitted && currentDrawingIndex < drawings.length - 1) {
        const timer = setTimeout(() => {
          setCurrentDrawingIndex(prev => prev + 1);
        }, 2000);
        return () => clearTimeout(timer);
      }
      // Если все отправили и это последний рисунок - переходим к результатам
      else if (allSubmitted && currentDrawingIndex === drawings.length - 1) {
        const timer = setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [players, submitted, currentDrawing, currentDrawingIndex, drawings.length, checkAllPlayersSubmitted, onComplete]);

  // Таймер
  useEffect(() => {
    if (timeLeft > 0 && currentDrawing && !allPlayersSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } 
    // Время вышло - переходим к следующему рисунку или результатам
    else if (timeLeft === 0 && currentDrawing && !allPlayersSubmitted) {
      if (currentDrawingIndex < drawings.length - 1) {
        setTimeout(() => {
          setCurrentDrawingIndex(prev => prev + 1);
        }, 1000);
      } else {
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 1000);
      }
    }
  }, [timeLeft, currentDrawing, allPlayersSubmitted, currentDrawingIndex, drawings.length, onComplete]);

  const handleSubmit = useCallback(() => {
    if (currentGuess.trim() && currentDrawing) {
      setSubmitted(true);
      if (onSubmitGuess) {
        onSubmitGuess(currentGuess.trim(), currentDrawingIndex);
      }
    } else {
      alert("Пожалуйста, введите вашу догадку!");
    }
  }, [currentGuess, currentDrawing, onSubmitGuess, currentDrawingIndex]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getPlayerStatus = (player) => {
    // Если это текущий пользователь
    if (player.userid === user?.userid) {
      return submitted ? "submitted" : "guessing";
    }
    // Для других игроков используем статус из пропсов
    return player.status || "guessing";
  };

  const nextDrawing = () => {
    if (currentDrawingIndex < drawings.length - 1) {
      setCurrentDrawingIndex(prev => prev + 1);
    } else {
      if (onComplete) {
        onComplete();
      }
    }
  };

  const quickGuesses = ["Кот", "Собака", "Дом", "Машина", "Дерево", "Солнце", "Человек", "Птица"];

  if (!currentDrawing || drawings.length === 0) {
    return (
      <div className="guess-container">
        <div className="guess-loading-message">
          Загрузка рисунков...
        </div>
      </div>
    );
  }

  // Сообщения о статусе
  const getStatusMessage = () => {
    if (allPlayersSubmitted) {
      if (currentDrawingIndex < drawings.length - 1) {
        return "🎉 Все игроки угадали! Переходим к следующему рисунку...";
      } else {
        return "🎉 Все рисунки угаданы! Переходим к результатам...";
      }
    }
    
    if (timeLeft === 0) {
      if (currentDrawingIndex < drawings.length - 1) {
        return "⏰ Время вышло! Переходим к следующему рисунку...";
      } else {
        return "⏰ Время вышло! Переходим к результатам...";
      }
    }
    
    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="guess-container">
      {/* Шапка */}
      <header className="guess-header">
        <button className="guess-back-button" onClick={onBack}>
          ← Назад
        </button>
        <div className="guess-title">
          <h1>🎯 Время угадывать!</h1>
          <div className="guess-room-info">
            Комната: {roomCode} | Рисунок {currentDrawingIndex + 1} из {drawings.length}
          </div>
        </div>
        <div className="guess-timer-section">
          <div className={`guess-timer ${timeLeft <= 10 ? 'urgent' : ''}`}>
            ⏰ {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      {/* Статусное сообщение */}
      {statusMessage && (
        <div className="guess-status-message">
          {statusMessage}
        </div>
      )}

      <div className="guess-content">
        {/* Левая панель - управление */}
        <div className="guess-control-panel">
          {/* Блок ввода догадки */}
          <div className="guess-input-card">
            <h3>💭 Ваша догадка</h3>
            <div className="guess-input-wrapper">
              <input
                type="text"
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Что изображено на рисунке?"
                maxLength={50}
                disabled={submitted || allPlayersSubmitted || timeLeft === 0}
                className="guess-input"
              />
              <div className="guess-char-counter">
                {currentGuess.length}/50 символов
              </div>
            </div>
            
            {!submitted && !allPlayersSubmitted && timeLeft > 0 ? (
              <button
                onClick={handleSubmit}
                disabled={!currentGuess.trim()}
                className={`guess-send-button ${currentGuess.trim() ? 'active' : ''}`}
              >
                🚀 Отправить догадку
              </button>
            ) : (
              <div className="guess-success-card">
                <div className="guess-success-icon">
                  {submitted ? '✅' : '⏰'}
                </div>
                <div className="guess-success-content">
                  <h4>
                    {submitted ? 'Успешно отправлено!' : 
                     timeLeft === 0 ? 'Время вышло!' : 'Ожидаем других игроков...'}
                  </h4>
                  <p>{submitted ? `«${currentGuess}»` : 'Дождитесь завершения раунда'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Блок подсказки */}
          <div className="guess-hint-card">
            <h4>💡 Подсказка</h4>
            <button 
              className={`guess-hint-button ${showHint ? 'active' : ''}`}
              onClick={() => setShowHint(!showHint)}
              disabled={submitted || allPlayersSubmitted || timeLeft === 0}
            >
              {showHint ? '👁️ Скрыть подсказку' : '🔍 Показать подсказку'}
            </button>
            {showHint && currentDrawing.word && (
              <div className="guess-hint-content">
                Первая буква: <span className="guess-hint-letter">{currentDrawing.word.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* Быстрые варианты */}
          <div className="guess-quick-card">
            <h4>⚡ Быстрые варианты</h4>
            <div className="guess-quick-grid">
              {quickGuesses.map((word, index) => (
                <button
                  key={index}
                  className="guess-quick-item"
                  onClick={() => setCurrentGuess(word)}
                  disabled={submitted || allPlayersSubmitted || timeLeft === 0}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          {/* Кнопка принудительного перехода (для тестирования) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="guess-next-card">
              <button className="guess-next-button" onClick={nextDrawing}>
                ⏭️ Тест: Следующий рисунок
              </button>
              <button className="guess-next-button" onClick={onComplete}>
                🏆 Тест: К результатам
              </button>
            </div>
          )}
        </div>

        {/* Центральная панель - рисунок */}
        <div className="guess-main-panel">
          {/* Информация о художнике */}
          <div className="guess-artist-info">
            <div className="guess-artist-badge">
              <div className="guess-artist-avatar">🎨</div>
              <div className="guess-artist-text">
                <div className="guess-artist-name">Анонимный художник</div>
                <div className="guess-artist-desc">Попробовал изобразить что-то интересное...</div>
              </div>
            </div>
          </div>

          {/* Область рисунка */}
          <div className="guess-drawing-space">
            <div className="guess-drawing-frame">
              <img 
                src={currentDrawing.image || currentDrawing.dataURL} 
                alt="Рисунок для угадывания"
                className="guess-drawing-img"
                onError={(e) => {
                  console.error("Ошибка загрузки изображения:", currentDrawing);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Прогресс времени */}
          <div className="guess-time-progress">
            <div className="guess-time-text">
              Осталось времени: <span className="guess-time-value">{formatTime(timeLeft)}</span>
            </div>
            <div className="guess-progress-bar">
              <div 
                className="guess-progress-fill" 
                style={{ width: `${((45 - timeLeft) / 45) * 100}%` }}
              />
            </div>
          </div>

          {/* Индикатор прогресса игроков */}
          <div className="guess-players-progress">
            <div className="guess-progress-text">
              Игроков угадали: {players.filter(p => getPlayerStatus(p) === 'submitted').length} из {players.length}
            </div>
            <div className="guess-progress-bar">
              <div 
                className="guess-progress-fill players" 
                style={{ 
                  width: `${(players.filter(p => getPlayerStatus(p) === 'submitted').length / Math.max(players.length, 1)) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Правая панель - игроки */}
        <div className="guess-players-panel">
          <h3>👥 Игроки онлайн</h3>
          
          {/* Прогресс угадывания */}
          <div className="guess-stats-card">
            <div className="guess-stats-header">
              <span>Прогресс угадывания</span>
              <span className="guess-stats-count">
                {players.filter(p => getPlayerStatus(p) === 'submitted').length}/{players.length}
              </span>
            </div>
            <div className="guess-stats-progress">
              <div 
                className="guess-stats-fill" 
                style={{ 
                  width: `${(players.filter(p => getPlayerStatus(p) === 'submitted').length / Math.max(players.length, 1)) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Список игроков */}
          <div className="guess-players-list">
            {players.map((player) => (
              <div key={player.userid} className={`guess-player-card ${getPlayerStatus(player)}`}>
                <div className="guess-player-avatar">
                  {player.login?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="guess-player-info">
                  <div className="guess-player-name">
                    {player.login}
                    {player.userid === user?.userid && <span className="guess-you-label">(Вы)</span>}
                  </div>
                  <div className="guess-player-status">
                    {getPlayerStatus(player) === 'submitted' ? (
                      <span className="guess-status-done">✅ Угадал</span>
                    ) : (
                      <span className="guess-status-thinking">🤔 Думает...</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Статистика раунда */}
          <div className="guess-round-stats">
            <h4>📊 Статистика раунда</h4>
            <div className="guess-stats-grid">
              <div className="guess-stat-box">
                <div className="guess-stat-number">{currentDrawingIndex + 1}</div>
                <div className="guess-stat-label">Текущий</div>
              </div>
              <div className="guess-stat-box">
                <div className="guess-stat-number">{drawings.length}</div>
                <div className="guess-stat-label">Всего</div>
              </div>
              <div className="guess-stat-box">
                <div className="guess-stat-number">{timeLeft}</div>
                <div className="guess-stat-label">Секунд</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}