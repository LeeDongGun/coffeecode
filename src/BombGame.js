import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, UserPlus, X, Play, RefreshCw, Bomb, Forward } from 'lucide-react';

const BIN_ID = process.env.REACT_APP_JSONBIN_BIN_ID;
const API_KEY = "$2a$10$DnO/7.T9TYW8KlXg1lhoRu4jxMaIw6jmmgwf5DPMLI/l2fBDLkEKu";
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

const missions = [
  "가장 최근에 먹은 음식은?", "오늘 아침에 일어나서 한 일은?", "가장 좋아하는 계절과 그 이유는?",
  "최근에 본 영화나 드라마는?", "가장 어이없었던 실수는?", "핸드폰 배경화면은 무엇인가요?",
  "노래방 애창곡은?", "나만 아는 비밀 장소는?", "최근에 가장 웃겼던 일은?",
  "가장 좋아하는 음식은?", "어렸을 적 꿈은?", "10년 뒤 나는 어떤 모습일까?",
];

export default function BombGame() {
  const [players, setPlayers] = useState(['참가자 1', '참가자 2', '참가자 3', '참가자 4']);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [gameState, setGameState] = useState('waiting'); // waiting, running, over
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentMission, setCurrentMission] = useState('');

  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    // 데이터 로드
    const loadGameData = async () => {
      if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE' || !BIN_ID) {
        setIsDataLoaded(true);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/latest`, { headers: { 'X-Master-Key': API_KEY } });
        if (response.ok) {
          const data = await response.json();
          if (data.record && data.record.players && data.record.players.length > 0) {
            setPlayers(data.record.players);
          }
        }
      } catch (error) {
        console.error('Failed to load player data:', error);
      } finally {
        setIsDataLoaded(true);
      }
    };
    loadGameData();
  }, []);

  const handleStart = () => {
    if (players.length < 2) {
      alert('최소 2명의 참가자가 필요합니다.');
      return;
    }
    const randomTime = Math.random() * 20 + 10; // 10초 ~ 30초
    setTimeLeft(randomTime);
    startTimeRef.current = randomTime;

    setCurrentPlayerIndex(Math.floor(Math.random() * players.length));
    setCurrentMission(missions[Math.floor(Math.random() * missions.length)]);
    setGameState('running');

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.01) {
          clearInterval(timerRef.current);
          setGameState('over');
          return 0;
        }
        return prev - 0.01;
      });
    }, 10);
  };

  const handlePass = () => {
    setCurrentPlayerIndex(prev => (prev + 1) % players.length);
  };

  const handleReset = () => {
    clearInterval(timerRef.current);
    setGameState('waiting');
    setTimeLeft(0);
    setCurrentMission('');
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current); // 컴포넌트 언마운트 시 타이머 정리
  }, []);

  const addPlayer = () => {
    setPlayers(prev => [...prev, `참가자 ${prev.length + 1}`]);
  };

  const removePlayer = (indexToRemove) => {
    if (players.length <= 2) {
      alert('최소 2명의 참가자는 있어야 합니다.');
      return;
    }
    setPlayers(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">💣 폭탄 돌리기 💣</h1>
      <p className="text-center text-gray-600 mb-6">폭탄이 터지기 전에 다음 사람에게 넘기세요!</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Player Settings */}
        <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><Users className="mr-2"/>참가자</h2>
          <div className="space-y-2 mb-6">
            {players.map((player, index) => (
              <div key={index} className={`flex items-center gap-2 p-2 rounded-lg transition-all ${currentPlayerIndex === index && gameState === 'running' ? 'bg-yellow-200 scale-105' : 'bg-gray-100'}`}>
                <span className="flex-grow font-semibold">{player}</span>
                {gameState === 'waiting' && <button onClick={() => removePlayer(index)} className="p-1 text-gray-500 hover:text-red-500"><X size={16}/></button>}
              </div>
            ))}
          </div>
          {gameState === 'waiting' && (
            <button onClick={addPlayer} className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              <UserPlus size={18}/> 참가자 추가
            </button>
          )}
        </div>

        {/* Right: Game Area */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-between min-h-[400px]">
          {gameState === 'over' ? (
            <div className="text-center flex flex-col justify-center items-center h-full">
              <h2 className="text-4xl font-bold text-red-600 mb-4">펑!</h2>
              <Bomb size={100} className="text-red-500 mb-6"/>
              <p className="text-2xl mb-2">당첨자는...</p>
              <p className="text-4xl font-extrabold text-blue-600 animate-pulse">{players[currentPlayerIndex]}</p>
              <button onClick={handleReset} className="mt-8 flex items-center gap-2 py-3 px-6 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 transition-colors shadow-md">
                <RefreshCw size={20}/> 다시하기
              </button>
            </div>
          ) : (
            <>
              {/* Timer and Bomb */}
              <div className="text-center">
                <div className={`text-6xl font-mono font-bold mb-4 transition-all ${timeLeft <= 5 && gameState === 'running' ? 'text-red-700 scale-110' : 'text-red-500'}`}>
                  {timeLeft.toFixed(2)}
                </div>
                <div className="mb-6 relative h-20 flex items-center justify-center">
                  <Bomb size={80} className={`text-gray-800 ${gameState === 'running' ? 'animate-bomb-shake' : ''}`}/>
                </div>
              </div>

              {/* Mission */}
              <div className="w-full text-center bg-yellow-100 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-yellow-800">미션</h3>
                <p className="text-gray-700 mt-1">{gameState === 'running' ? currentMission : '게임 시작 버튼을 눌러주세요.'}</p>
              </div>

              {/* Current Player */}
              <div className="w-full text-center mb-6">
                <p className="text-gray-600">현재 플레이어</p>
                <p className="text-2xl font-bold">{gameState === 'running' ? players[currentPlayerIndex] : '-'}</p>
              </div>

              {/* Controls */}
              <div className="w-full flex justify-center items-center gap-4">
                {gameState === 'waiting' && (
                  <button onClick={handleStart} className="flex items-center gap-2 py-3 px-6 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 transition-colors shadow-md">
                    <Play size={20}/> 게임 시작
                  </button>
                )}
                {gameState === 'running' && (
                  <button onClick={handlePass} className="flex items-center gap-2 py-3 px-6 bg-gray-700 text-white font-bold rounded-full hover:bg-gray-800 transition-colors shadow-md animate-pulse">
                    <Forward size={20}/> 폭탄 넘기기
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
