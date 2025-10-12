import React, { useState, useEffect } from 'react';
import './App.css';
import MainScreen from './pages/MainScreen';
import RegisterWindow from './pages/RegisterWindow';
import LoginWindow from './pages/LoginWindow';
import ChooseGameMode from './pages/ChooseGameMode';
import RoomPage from './pages/RoomPage';
import SettingsWindow from './pages/SettingsWindow';
import { useAuth } from './context/AuthContext';
import CreateWordsPage from './pages/CreateWordsPage';
import DrawingPage from './pages/DrawingPage';
import GuessingPage from './pages/GuessingPage';
import ResultsPage from './pages/ResultsPage';

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChooseGame, setShowChooseGame] = useState(false);
  const [showRoom, setShowRoom] = useState(false);
  const [showCreateWords, setShowCreateWords] = useState(false);
  const [showDrawing, setShowDrawing] = useState(false);
  const [showGuessing, setShowGuessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [roomCodeForJoin, setRoomCodeForJoin] = useState(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [submittedWords, setSubmittedWords] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [gameResults, setGameResults] = useState(null);
  const [roomPlayers, setRoomPlayers] = useState([]); // Добавляем состояние для игроков комнаты
  
  const { user, login, register, logout, isAuthenticated } = useAuth();
  const [userStats, setUserStats] = useState({
    games: 0,
    wins: 0,
    points: 0,
  });

  useEffect(() => {
    if (
      showRegister ||
      showLogin ||
      showSettings ||
      showChooseGame ||
      showRoom ||
      showCreateWords ||
      showDrawing ||
      showGuessing ||
      showResults
    ) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showRegister, showLogin, showSettings, showChooseGame, showRoom, showCreateWords, showDrawing, showGuessing, showResults]);

  useEffect(() => {
    if (user) {
      setUserStats({
        games: user.gamesplayed || 0,
        wins: user.gameswon || 0,
        points: user.points || 0,
      });
    }
  }, [user]);

  // Функция для получения игроков комнаты из базы данных
  const fetchRoomPlayers = async (roomCode) => {
    try {
      const response = await fetch(`/api/rooms/${roomCode}/players`);
      if (response.ok) {
        const players = await response.json();
        setRoomPlayers(players);
        return players;
      } else {
        console.error('Ошибка при получении игроков комнаты');
        return [];
      }
    } catch (error) {
      console.error('Ошибка при запросе игроков:', error);
      return [];
    }
  };

  // Функция для получения реальных результатов игры
  const fetchGameResults = async (roomCode) => {
    try {
      const response = await fetch(`/api/games/${roomCode}/results`);
      if (response.ok) {
        const results = await response.json();
        setGameResults(results);
        return results;
      } else {
        console.error('Ошибка при получении результатов игры');
        return null;
      }
    } catch (error) {
      console.error('Ошибка при запросе результатов:', error);
      return null;
    }
  };
  
  const switchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const switchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setUserStats({ games: 12, wins: 8, points: 450 });
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    setUserStats({ games: 0, wins: 0, points: 0 });
  };

  const handleBackFromChooseGame = () => {
    setShowChooseGame(false);
  };

  // Обработка присоединения по коду - загружаем игроков
  const handleJoinByCode = async (code) => {
    setRoomCodeForJoin(code);
    setIsCreatingRoom(false);
    setShowChooseGame(false);
    const players = await fetchRoomPlayers(code);
    setRoomPlayers(players);
    setShowRoom(true);
  };

  // Обработка создания комнаты - загружаем игроков
  const handleRoomCreated = async (roomId) => {
    console.log('🎉 Комната создана, переходим в RoomPage с ID:', roomId);
    setRoomCodeForJoin(roomId);
    setIsCreatingRoom(true);
    setShowChooseGame(false);
    const players = await fetchRoomPlayers(roomId);
    setRoomPlayers(players);
    setShowRoom(true);
  };

  // Обработка возврата из комнаты
  const handleBackFromRoom = () => {
    setShowRoom(false);
    setShowChooseGame(true);
    setRoomPlayers([]); // Сбрасываем игроков при выходе
  };

  // Обработка возврата из результатов
  const handleBackFromResults = () => {
    setShowResults(false);
    setShowChooseGame(true);
    setRoomPlayers([]); // Сбрасываем игроков
  };

  // Обработчик новой игры
  const handlePlayAgain = () => {
    setShowResults(false);
    setShowRoom(true);
    // Сбрасываем данные игры
    setDrawings([]);
    setSubmittedWords([]);
    setGameResults(null);
  };

  // Обработчик клика на "Создать комнату" в MainScreen
  const handleCreateRoomClick = () => {
    setShowChooseGame(true);
  };

  // Обработчик начала игры - переходит на страницу ввода слов
  const handleStartGame = (roomCode, players) => {
    console.log('🎮 Начинаем игру в комнате:', roomCode, 'Игроки:', players);
    setShowRoom(false);
    setShowCreateWords(true);
  };

  // Обработчик отправки слов - переходит на страницу рисования
  const handleSubmitWords = (words) => {
    console.log('📝 Слова отправлены:', words);
    setSubmittedWords(words);
    setShowCreateWords(false);
    setShowDrawing(true);
  };

  // Обработчик завершения рисования - переходит на страницу угадывания
  const handleDrawingComplete = (drawingData) => {
    console.log('🎨 Рисунок завершен:', drawingData);
    // Сохраняем рисунок
    const newDrawing = {
      id: Date.now(),
      image: drawingData,
      dataURL: drawingData,
      word: submittedWords[0] || 'Слово',
      artist: user?.login || 'Игрок',
      playerId: user?.userid || 'unknown'
    };
    
    setDrawings(prev => [...prev, newDrawing]);
    setShowDrawing(false);
    setShowGuessing(true);
  };

  // Обработчик возврата со страницы рисования
  const handleBackFromDrawing = () => {
    setShowDrawing(false);
    setShowRoom(true);
  };

  // Обработчик возврата со страницы угадывания
  const handleBackFromGuessing = () => {
    setShowGuessing(false);
    setShowRoom(true);
  };

  // Обработчик завершения угадывания - переходит на страницу результатов
  const handleGuessingComplete = async () => {
    console.log('🎯 Угадывание завершено, переходим к результатам');
    
    // Получаем реальные результаты из базы данных
    const results = await fetchGameResults(roomCodeForJoin);
    
    if (!results) {
      // Если не удалось получить результаты, создаем mock данные
      const mockResults = {
        roomCode: roomCodeForJoin,
        rounds: drawings.map((drawing, index) => ({
          roundNumber: index + 1,
          drawing: {
            playerId: drawing.playerId,
            word: drawing.word,
            imageData: drawing.image
          },
          guesses: [
            {
              playerId: user?.userid || 'user1',
              guess: 'Кот',
              isCorrect: true,
              timestamp: new Date().toISOString()
            }
          ]
        })),
        players: roomPlayers.length > 0 ? roomPlayers : [
          { userid: user?.userid || 'user1', login: user?.login || 'Вы' }
        ]
      };
      setGameResults(mockResults);
    }
    
    setShowGuessing(false);
    setShowResults(true);
  };

  // Обработчик отправки догадки
  const handleSubmitGuess = (guess, drawingIndex) => {
    console.log('🔍 Догадка отправлена:', guess, 'для рисунка:', drawingIndex);
    // Здесь будет логика обработки догадки на сервере
  };

  // Закрыть все модальные окна и вернуться на главный экран
  const closeAllModals = () => {
    setShowRegister(false);
    setShowLogin(false);
    setShowSettings(false);
    setShowChooseGame(false);
    setShowRoom(false);
    setShowCreateWords(false);
    setShowDrawing(false);
    setShowGuessing(false);
    setShowResults(false);
    setRoomPlayers([]); // Сбрасываем игроков
  };

  return (
    <div className="App" style={{ minHeight: '100vh' }}>
      {/* Главный экран */}
      {!showChooseGame && !showRegister && !showLogin && !showSettings && !showRoom && !showCreateWords && !showDrawing && !showGuessing && !showResults && (
        <MainScreen
          onLoginClick={() => setShowLogin(true)}
          onRegisterClick={() => setShowRegister(true)}
          onSettingsClick={() => setShowSettings(true)}
          onStartGameClick={() => setShowChooseGame(true)}
          onCreateRoomClick={handleCreateRoomClick}
          isAuthenticated={isAuthenticated}
          onLogoutClick={logout}
          userStats={userStats}
        />
      )}

      {/* Выбор режима игры */}
      {showChooseGame && (
        <ChooseGameMode
          onBack={handleBackFromChooseGame}
          onJoinByCode={handleJoinByCode}
          onRoomCreated={handleRoomCreated}
          availableRooms={[]}
          onStartGame={handleStartGame}
        />
      )}

      {/* Страница создания слов */}
      {showCreateWords && (
        <CreateWordsPage
          onBack={() => setShowCreateWords(false)}
          onSubmitWords={handleSubmitWords}
          players={roomPlayers} // Передаем реальных игроков из БД
          roomCode={roomCodeForJoin}
        />
      )}

      {/* Страница рисования */}
      {showDrawing && (
        <DrawingPage
          onBack={handleBackFromDrawing}
          onDrawingComplete={handleDrawingComplete}
          words={submittedWords}
          players={roomPlayers} // Передаем реальных игроков из БД
          roomCode={roomCodeForJoin}
        />
      )}

      {/* Страница угадывания */}
      {showGuessing && (
        <GuessingPage
          onBack={handleBackFromGuessing}
          onSubmitGuess={handleSubmitGuess}
          drawings={drawings}
          players={roomPlayers.length > 0 ? roomPlayers : [ // Используем реальных игроков или текущего пользователя
            { userid: user?.userid || 'user1', login: user?.login || 'Вы', status: 'submitted' }
          ]}
          roomCode={roomCodeForJoin}
          onComplete={handleGuessingComplete}
        />
      )}

      {/* Страница результатов */}
      {showResults && (
        <ResultsPage
          onBack={handleBackFromResults}
          onPlayAgain={handlePlayAgain}
          gameResults={gameResults}
          players={roomPlayers.length > 0 ? roomPlayers : [ // Используем реальных игроков или текущего пользователя
            { userid: user?.userid || 'user1', login: user?.login || 'Вы' }
          ]}
          roomCode={roomCodeForJoin}
        />
      )}

      {/* Страница комнаты */}
      {showRoom && (
        <RoomPage
          roomCode={roomCodeForJoin}
          isCreating={isCreatingRoom}
          onBack={handleBackFromRoom}
          onStartGame={handleStartGame}
          players={roomPlayers} // Передаем реальных игроков в комнату
        />
      )}

      {/* Окно регистрации */}
      {showRegister && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}
        >
          <RegisterWindow
            onSwitchToLogin={switchToLogin}
            onRegisterSuccess={handleRegisterSuccess}
            onHomeClick={closeAllModals}
            onRegister={register}
          />
        </div>
      )}

      {/* Окно входа */}
      {showLogin && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}
        >
          <LoginWindow
            onSwitchToRegister={switchToRegister}
            onLoginSuccess={handleLoginSuccess}
            onHomeClick={closeAllModals}
            onLogin={login}
          />
        </div>
      )}

      {/* Окно настроек */}
      {showSettings && (
        <SettingsWindow onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App;