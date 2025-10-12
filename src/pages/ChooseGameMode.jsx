import React, { useState, useEffect, useCallback } from "react";
import "./ChooseGameMode.css";
import { useAuth } from '../context/AuthContext';
import { gameAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';

const gameModes = [
  {
    id: "classic",
    title: "Классический Gartic Phone",
    description: "Рисуй и угадывай по цепочке. Классические правила игры",
    duration: "15-20 мин",
    players: "4-8 игроков",
    rounds: 3
  },
  {
    id: "fast",
    title: "Быстрая игра",
    description: "Укороченная версия с быстрыми раундами",
    duration: "8-10 мин",
    players: "3-6 игроков",
    rounds: 2
  },
  {
    id: "marathon",
    title: "Марафон",
    description: "Больше раундов, больше веселья!",
    duration: "25-35 мин",
    players: "4-8 игроков",
    rounds: 5
  },
];

export default function ChooseGameMode({ 
  onBack, 
  onJoinByCode, 
  onRoomCreated
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState("classic");
  const [roomCode, setRoomCode] = useState("");
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);
  const [roomPassword, setRoomPassword] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Функция для загрузки доступных комнат
  const loadAvailableRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await gameAPI.getActiveRooms();
      const rooms = response.data.rooms || [];
      
      // Фильтруем комнаты: только ожидающие и с свободными местами
      const filteredRooms = rooms.filter(room => 
        room.status === 'waiting' && 
        room.currentplayers < room.maxplayers
      );
      
      setAvailableRooms(filteredRooms);
    } catch (error) {
      console.log('Не удалось загрузить список активных комнат');
      setAvailableRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Загружаем доступные комнаты при монтировании
  useEffect(() => {
    loadAvailableRooms();
  }, [loadAvailableRooms]);

  const handleCreateRoom = async () => {
    if (!selectedMode) {
      alert("Выберите режим игры");
      return;
    }

    if (!user) {
      alert("Необходимо авторизоваться");
      return;
    }

    try {
      setCreating(true);

      const roomData = {
        title: `Комната ${user.Login}`,
        gamemode: selectedMode,
        maxPlayers: 8,
        totalRounds: 3,
        isPrivate: false,
        password: null
      };

      const response = await gameAPI.createGame(roomData);

      if (response.data && response.data.game) {
        const gameId = response.data.game.gameid;
        
        // Вызываем колбэк для перехода на страницу комнаты
        if (typeof onRoomCreated === "function") {
          onRoomCreated(gameId);
        }
      }

    } catch (error) {
      alert("Ошибка создания комнаты");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinByCodeClick = async () => {
    if (!roomCode.trim()) {
      alert("Введите код комнаты");
      return;
    }

    if (!user) {
      alert("Необходимо авторизоваться");
      return;
    }

    try {
      setLoading(true);
      
      // Переход на страницу комнаты по коду
      navigate(`/room/${roomCode.trim()}`);
      
      // Или если используешь callback
      if (typeof onJoinByCode === "function") {
        onJoinByCode(roomCode.trim());
      }

    } catch (error) {
      alert("Ошибка присоединения");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId) => {
    if (!user) {
      alert("Необходимо авторизоваться");
      return;
    }

    try {
      // Переход на страницу комнаты
      navigate(`/room/${roomId}`);
      
      // Или если используешь callback
      if (typeof onJoinByCode === "function") {
        onJoinByCode(roomId.toString());
      }

    } catch (error) {
      alert("Ошибка присоединения");
    }
  };

  const handleRefresh = () => {
    loadAvailableRooms();
  };

  const getGameModeTitle = (modeId) => {
    const mode = gameModes.find(m => m.id === modeId);
    return mode ? mode.title : modeId;
  };

  // Функция для проверки, можно ли присоединиться к комнате
  const canJoinRoom = (room) => {
    return room.status === 'waiting' && room.currentplayers < room.maxplayers;
  };

  return (
    <div className="choose-game-container">
      <div className="choose-game-header">
        <button className="back-button" onClick={onBack}>
          Назад
        </button>
        <h2 className="choose-game-title">Gartic Phone - Выбор игры</h2>
        {user && <div className="user-info">Вы вошли как: {user.login}</div>}
      </div>

      <div className="choose-game-content">
        <div className="game-modes">
          <p className="section-title">Выберите режим игры</p>
          <div className="game-modes-list">
            {gameModes.map((mode) => (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`game-mode-card ${selectedMode === mode.id ? "selected" : ""}`}
              >
                <h3>{mode.title}</h3>
                <p className="description">{mode.description}</p>
                <div className="mode-info">
                  <span>🕒 {mode.duration}</span>
                  <span>👥 {mode.players}</span>
                  <span>🔁 {mode.rounds} раундов</span>
                </div>
                {selectedMode === mode.id && (
                  <div className="selected-indicator">✅ Выбрано</div>
                )}
              </div>
            ))}
          </div>

          {!user ? (
            <div className="auth-warning">
              ⚠️ Для создания комнаты необходимо авторизоваться
            </div>
          ) : (
            <>
              <div className="selected-mode-info">
                <strong>Выбран режим:</strong> {getGameModeTitle(selectedMode)}
              </div>

              <div className="room-settings">
                <div className="private-room-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={isPrivateRoom}
                      onChange={(e) => setIsPrivateRoom(e.target.checked)}
                      className="toggle-input"
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Приватная комната</span>
                  </label>
                </div>

                {isPrivateRoom && (
                  <div className="password-input">
                    <input
                      type="password"
                      value={roomPassword}
                      onChange={(e) => setRoomPassword(e.target.value)}
                      placeholder="Введите пароль для комнаты (минимум 4 символа)"
                      className="password-field"
                      minLength={4}
                    />
                    <p className="password-hint">🔒 Пароль потребуется для входа в комнату</p>
                  </div>
                )}
              </div>

              <button 
                className="create-room-btn" 
                onClick={handleCreateRoom}
                disabled={creating}
              >
                {creating ? 'Создание...' : "🎮 Создать игровую комнату"}
              </button>
            </>
          )}
        </div>

        <div className="right-panel">
          <div className="join-by-code">
            <h3>🎯 Присоединиться по коду</h3>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Введите ID комнаты"
              disabled={!user}
            />
            <button 
              onClick={handleJoinByCodeClick} 
              disabled={!user || loading || !roomCode.trim()}
            >
              {loading ? 'Загрузка...' : 'Присоединиться'}
            </button>
            {!user && <p className="auth-hint">⚠️ Требуется авторизация</p>}
          </div>

          <div className="active-rooms">
            <div className="rooms-header">
              <h3>🎪 Доступные комнаты ({availableRooms.length})</h3>
              <button onClick={handleRefresh} className="refresh-button" disabled={loading}>
                {loading ? '🔄' : '⟳ Обновить'}
              </button>
            </div>
            
            {loading ? (
              <div className="loading-message">🔄 Загрузка комнат...</div>
            ) : availableRooms.length > 0 ? (
              <div className="rooms-list">
                {availableRooms.map((room) => (
                  <div key={room.gameid} className="room-card">
                    <div className="room-info">
                      <div className="room-header">
                        <strong>{room.title || `Комната #${room.gameid}`}</strong>
                        <span className={`room-status ${room.status === 'waiting' ? 'active' : 'playing'}`}>
                          {room.status === 'waiting' ? '🟢 Ожидание' : '🎮 Играется'}
                        </span>
                      </div>
                      <div className="room-details">
                        <div className="room-mode">
                          🎯 Режим: {getGameModeTitle(room.gamemode)}
                        </div>
                        <div className="room-players">
                          👥 Игроков: {room.currentplayers}/{room.maxplayers}
                        </div>
                        <div className="room-time">
                          🕒 Создана: {new Date(room.createdat).toLocaleString()}
                        </div>
                        {room.isprivate && <div className="room-private">🔒 Приватная</div>}
                        {room.hostname && <div className="room-host">👑 Хост: {room.hostname}</div>}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleJoinRoom(room.gameid)}
                      className="join-button"
                      disabled={!user || !canJoinRoom(room)}
                    >
                      {!user ? 'Войти' : 
                       canJoinRoom(room) ? 'Присоединиться' : 
                       room.currentplayers >= room.maxplayers ? 'Полная' : 'Играется'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-rooms-message">
                {user ? (
                  <>
                    🏜️ Нет доступных комнат
                    <br />
                    <small>Создайте новую комнату и пригласите друзей!</small>
                  </>
                ) : (
                  <>
                    🔐 Требуется авторизация
                    <br />
                    <small>Войдите в систему, чтобы увидеть комнаты</small>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}