import React, { useState, useEffect } from "react";
import "./ResultsPage.css";
import { useAuth } from '../context/AuthContext';

export default function ResultsPage({ onBack, gameResults, players = [], roomCode, onPlayAgain }) {
  const { user } = useAuth();
  const [selectedRound, setSelectedRound] = useState(0);
  const [expandedDrawings, setExpandedDrawings] = useState({});

  // Если нет результатов, показываем заглушку
  if (!gameResults || !gameResults.rounds || gameResults.rounds.length === 0) {
    return (
      <div className="results-container">
        <header className="results-header">
          <button className="back-button" onClick={onBack}>
            ← Назад
          </button>
          <div className="results-title">
            <h1>🏆 Результаты игры</h1>
            <div className="room-info">Комната: {roomCode}</div>
          </div>
          <div className="results-actions">
            <button className="play-again-btn" onClick={onPlayAgain}>
              🎮 Новая игра
            </button>
          </div>
        </header>
        
        <div className="no-results">
          <div className="no-results-icon">📊</div>
          <h2>Результаты пока недоступны</h2>
          <p>Игра еще не завершена или произошла ошибка</p>
        </div>
      </div>
    );
  }

  const rounds = gameResults.rounds;
  const currentRound = rounds[selectedRound];

  // Получаем статистику игроков
  const getPlayerStats = (playerId) => {
    let correctGuesses = 0;
    let totalGuesses = 0;
    let drawings = 0;

    rounds.forEach(round => {
      // Считаем угаданные слова
      round.guesses?.forEach(guess => {
        if (guess.playerId === playerId && guess.isCorrect) {
          correctGuesses++;
        }
        if (guess.playerId === playerId) {
          totalGuesses++;
        }
      });

      // Считаем рисунки
      if (round.drawing?.playerId === playerId) {
        drawings++;
      }
    });

    return {
      correctGuesses,
      totalGuesses,
      drawings,
      accuracy: totalGuesses > 0 ? Math.round((correctGuesses / totalGuesses) * 100) : 0
    };
  };

  // Топ игроков
  const topPlayers = players.map(player => {
    const stats = getPlayerStats(player.userid);
    return {
      ...player,
      stats,
      score: stats.correctGuesses * 10 + stats.drawings * 5
    };
  }).sort((a, b) => b.score - a.score);

  const toggleDrawingExpand = (drawingId) => {
    setExpandedDrawings(prev => ({
      ...prev,
      [drawingId]: !prev[drawingId]
    }));
  };

  return (
    <div className="results-container">
      {/* Шапка */}
      <header className="results-header">
        <button className="back-button" onClick={onBack}>
          ← Назад
        </button>
        <div className="results-title">
          <h1>🏆 Результаты игры</h1>
          <div className="room-info">
            Комната: {roomCode} | Игроков: {players.length} | Раундов: {rounds.length}
          </div>
        </div>
        <div className="results-actions">
          <button className="play-again-btn" onClick={onPlayAgain}>
            🎮 Новая игра
          </button>
        </div>
      </header>

      <div className="results-content">
        {/* Левая панель - подиум и статистика */}
        <div className="results-sidebar">
          {/* Подиум */}
          <div className="podium-card">
            <h3>🏅 Подиум</h3>
            <div className="podium">
              {topPlayers.slice(0, 3).map((player, index) => (
                <div key={player.userid} className={`podium-place place-${index + 1}`}>
                  <div className="podium-rank">{index + 1}</div>
                  <div className="podium-avatar">
                    {player.login?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="podium-info">
                    <div className="podium-name">
                      {player.login}
                      {player.userid === user?.userid && <span className="you-badge">(Вы)</span>}
                    </div>
                    <div className="podium-score">{player.score} очков</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Статистика игроков */}
          <div className="stats-card">
            <h3>📊 Статистика</h3>
            <div className="players-stats">
              {topPlayers.map((player, index) => (
                <div key={player.userid} className="player-stat">
                  <div className="stat-rank">#{index + 1}</div>
                  <div className="stat-avatar">
                    {player.login?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="stat-info">
                    <div className="stat-name">
                      {player.login}
                      {player.userid === user?.userid && <span className="you-badge">(Вы)</span>}
                    </div>
                    <div className="stat-details">
                      {player.stats.correctGuesses} ✓ • {player.stats.accuracy}% точность
                    </div>
                  </div>
                  <div className="stat-score">{player.score}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Основная панель - результаты раундов */}
        <div className="results-main">
          {/* Переключение раундов */}
          <div className="rounds-navigation">
            <h3>📋 Раунды</h3>
            <div className="rounds-tabs">
              {rounds.map((round, index) => (
                <button
                  key={index}
                  className={`round-tab ${selectedRound === index ? 'active' : ''}`}
                  onClick={() => setSelectedRound(index)}
                >
                  Раунд {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Контент раунда */}
          <div className="round-results">
            {/* Информация о раунде */}
            <div className="round-header">
              <h2>Раунд {selectedRound + 1}</h2>
              <div className="round-artist">
                Художник: <span className="artist-name">
                  {players.find(p => p.userid === currentRound.drawing?.playerId)?.login || 'Неизвестно'}
                </span>
              </div>
            </div>

            {/* Основной рисунок раунда */}
            {currentRound.drawing && (
              <div className="main-drawing-card">
                <div className="drawing-header">
                  <div className="drawing-title">
                    <span className="word-badge">Слово: {currentRound.drawing.word}</span>
                  </div>
                  <button 
                    className="expand-btn"
                    onClick={() => toggleDrawingExpand(`main-${selectedRound}`)}
                  >
                    {expandedDrawings[`main-${selectedRound}`] ? '📏 Свернуть' : '📏 Развернуть'}
                  </button>
                </div>
                
                <div className={`drawing-container ${expandedDrawings[`main-${selectedRound}`] ? 'expanded' : ''}`}>
                  <img 
                    src={currentRound.drawing.imageData} 
                    alt={`Рисунок: ${currentRound.drawing.word}`}
                    className="drawing-image"
                  />
                </div>

                {/* Результаты угадывания */}
                <div className="guessing-results">
                  <h4>Результаты угадывания:</h4>
                  <div className="guesses-list">
                    {currentRound.guesses?.map((guess, index) => {
                      const guessPlayer = players.find(p => p.userid === guess.playerId);
                      return (
                        <div key={index} className={`guess-result ${guess.isCorrect ? 'correct' : 'incorrect'}`}>
                          <div className="guess-player">
                            <span className="player-avatar-small">
                              {guessPlayer?.login?.charAt(0).toUpperCase() || '?'}
                            </span>
                            {guessPlayer?.login || 'Игрок'}
                          </div>
                          <div className="guess-text">«{guess.guess}»</div>
                          <div className="guess-status">
                            {guess.isCorrect ? '✅ Верно' : '❌ Неверно'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Все рисунки раунда (если есть) */}
            {currentRound.allDrawings && currentRound.allDrawings.length > 0 && (
              <div className="all-drawings-section">
                <h3>🎨 Все рисунки раунда</h3>
                <div className="drawings-grid">
                  {currentRound.allDrawings.map((drawing, index) => (
                    <div key={index} className="drawing-mini-card">
                      <div className="mini-drawing-header">
                        <span className="mini-artist">
                          {players.find(p => p.userid === drawing.playerId)?.login || 'Игрок'}
                        </span>
                        <span className="mini-word">{drawing.word}</span>
                      </div>
                      <div className="mini-drawing-container">
                        <img 
                          src={drawing.imageData} 
                          alt={`Рисунок: ${drawing.word}`}
                          className="mini-drawing-image"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="results-footer">
        <button className="action-btn secondary" onClick={onBack}>
          📋 К списку комнат
        </button>
        <button className="action-btn primary" onClick={onPlayAgain}>
          🎮 Играть еще раз
        </button>
      </div>
    </div>
  );
}