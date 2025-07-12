import React, { useState, useEffect, useCallback } from 'react';
import { Coffee, Users, RotateCcw, BarChart3, Trophy, UserPlus, X } from 'lucide-react';

const BIN_ID = process.env.REACT_APP_JSONBIN_BIN_ID;
const API_KEY = "$2a$10$DnO/7.T9TYW8KlXg1lhoRu4jxMaIw6jmmgwf5DPMLI/l2fBDLkEKu";
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export default function CoffeeGame2() {
  const [players, setPlayers] = useState(['참가자 1', '참가자 2', '참가자 3', '참가자 4', '참가자 5']);
  const [winner, setWinner] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempName, setTempName] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showAllStats, setShowAllStats] = useState(false);
  const [dontRecord, setDontRecord] = useState(false);
  const [spinOffset, setSpinOffset] = useState(0);
  const [animationClass, setAnimationClass] = useState('');

  const ITEM_HEIGHT = 80; // 각 아이템의 높이
  const VISIBLE_ITEMS = 5; // 보이는 아이템 개수
  const WHEEL_HEIGHT = 320; // 휠 컨테이너 높이 (h-80 = 320px)
  const WHEEL_CENTER = WHEEL_HEIGHT / 2; // 휠의 중앙 위치 (160px)

  const calculateStats = useCallback(() => {
    const newStats = {};
    const totalGames = gameHistory.length;

    const allPlayerNames = new Set(players);
    if (gameHistory && gameHistory.length > 0) {
      gameHistory.forEach(game => {
        if(game.players) game.players.forEach(p => allPlayerNames.add(p));
      });
    }

    allPlayerNames.forEach(player => {
      const wins = gameHistory.filter(game => game.winner === player).length;
      const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;
      
      newStats[player] = {
        wins,
        winRate,
        totalGames,
      };
    });
    
    setStats(newStats);
  }, [gameHistory, players]);

  // 데이터 로드
  useEffect(() => {
    const loadGameData = async () => {
      console.log('Attempting to load data from JSONBin.io...');
      console.log('BIN ID:', BIN_ID);
      console.log('API Key:', API_KEY ? '******' : '(not set)');

      if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE' || !BIN_ID) {
        console.warn('JSONBin API Key or Bin ID is not configured. Skipping server load.');
        setIsDataLoaded(true);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/latest`, {
          headers: { 'X-Master-Key': API_KEY },
        });

        console.log('JSONBin API Response:', response);

        if (response.ok) {
          const data = await response.json();
          console.log('Successfully loaded data:', data.record);

          if (data.record) {
            if (data.record.players && data.record.players.length > 0) {
              setPlayers(data.record.players);
            }
            if (data.record.gameHistory) {
              setGameHistory(data.record.gameHistory);
            }
          }
        } else {
          console.error(`Failed to load data: ${response.status} ${response.statusText}`);
          const errorData = await response.text();
          console.error('Error details:', errorData);
          console.log('No existing data found on server. Starting fresh.');
        }
      } catch (error) {
        console.error('Failed to load data from server due to a network or other error:', error);
      } finally {
        setIsDataLoaded(true);
      }
    };
    loadGameData();
  }, []);

  // 데이터 저장
  useEffect(() => {
    if (!isDataLoaded || !API_KEY || API_KEY === 'YOUR_API_KEY_HERE' || !BIN_ID) {
      return;
    }

    const saveGameData = async () => {
      try {
        await fetch(API_URL, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_KEY,
          },
          body: JSON.stringify({ players, gameHistory }),
        });
      } catch (error) {
        console.error('Failed to save data to server:', error);
      }
    };
    
    const handler = setTimeout(() => {
      saveGameData();
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [players, gameHistory, isDataLoaded]);

  // 통계 계산
  useEffect(() => {
    calculateStats();
  }, [gameHistory, players, calculateStats]);

  const saveGameResult = useCallback((winnerName) => {
    const now = new Date();
    const newResult = {
      id: Date.now(),
      winner: winnerName,
      players: [...players],
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('ko-KR'),
      time: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    
    const updatedHistory = [...gameHistory, newResult];
    setGameHistory(updatedHistory);
  }, [players, gameHistory]);

  const clearHistory = () => {
    if (window.confirm('모든 게임 기록을 삭제하시겠습니까?')) {
      setGameHistory([]);
    }
  };

  const addPlayer = () => {
    setPlayers(prev => [...prev, `참가자 ${prev.length + 1}`]);
  };

  const removePlayer = (indexToRemove) => {
    if (players.length <= 1) {
      alert('최소 1명의 참가자는 있어야 합니다.');
      return;
    }
    const playerToRemove = players[indexToRemove];
    if (window.confirm(`'${playerToRemove}' 참가자를 삭제하시겠습니까?`)) {
      setPlayers(prev => prev.filter((_, index) => index !== indexToRemove));
    }
  };

  // iOS date picker 스타일의 회전 로직
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selectRandomPlayer = useCallback(() => {
    if (players.length === 0) return;

    setIsSpinning(true);
    setWinner(null);
    setCountdown(3);

    const startSpinning = () => {
      // 랜덤한 최종 당첨자 선택
      const finalWinnerIndex = Math.floor(Math.random() * players.length);
      
      // 회전 횟수 계산 (최소 3바퀴, 최대 6바퀴)
      const minRotations = 5;
      const maxRotations = 7;
      const rotations = minRotations + Math.random() * (maxRotations - minRotations);
      
      // 총 회전할 아이템 개수 계산
      const totalSpins = Math.floor(rotations * players.length);
      
      // 수정된 계산: 위로 스크롤하도록 양수 값 사용
      const winnerPosition = finalWinnerIndex * ITEM_HEIGHT;
      const fullRotationDistance = totalSpins * ITEM_HEIGHT;
      // 위로 스크롤하도록 양수 값으로 변경
      const targetOffset = fullRotationDistance + winnerPosition;

      console.log('회전 정보:', {
        finalWinnerIndex,
        finalWinner: players[finalWinnerIndex],
        rotations: rotations.toFixed(2),
        totalSpins,
        winnerPosition,
        fullRotationDistance,
        targetOffset
      });

      // 애니메이션 시작
      setAnimationClass('spin-animation');
      setSpinOffset(targetOffset);

      // 애니메이션 완료 후 결과 처리
      setTimeout(() => {
        setAnimationClass('');
        setIsSpinning(false);
        setWinner(players[finalWinnerIndex]);
        
        if (!dontRecord) {
          saveGameResult(players[finalWinnerIndex]);
        }
      }, 4000); // 4초 애니메이션
    };

    // 카운트다운 후 시작
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startSpinning();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [players, dontRecord, saveGameResult]); // extendedPlayers는 함수 내에서 사용하지 않으므로 의존성에서 제외

  const handleNameEdit = (index, newName) => {
    if (newName.trim()) {
      setPlayers(prev => prev.map((p, i) => i === index ? newName.trim() : p));
    }
    setEditingIndex(null);
    setTempName('');
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setTempName(players[index]);
  };

  const resetGame = () => {
    setWinner(null);
    setSpinOffset(0);
    setAnimationClass('');
    setIsSpinning(false);
    setCountdown(0);
  };

  // 무한 스크롤을 위한 확장된 플레이어 리스트 생성
  const getExtendedPlayers = () => {
    if (players.length === 0) return [];
    
    // 충분한 회전을 위해 플레이어 리스트를 여러 번 반복
    // 최소 50개 아이템이 되도록 설정
    const minItems = 50;
    const repetitions = Math.max(Math.ceil(minItems / players.length), 10);
    const extended = [];
    
    for (let i = 0; i < repetitions; i++) {
      extended.push(...players);
    }
    
    return extended;
  };

  const extendedPlayers = getExtendedPlayers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500 rounded-full mb-4 shadow-lg">
            <Coffee className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-amber-800 mb-2">커피 뽑기 게임 v2</h1>
          <p className="text-amber-600">iOS 스타일 회전</p>
        </div>

        {/* 카운트다운 */}
        {countdown > 0 && (
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-amber-600">{countdown}</div>
          </div>
        )}

        {/* 회전 휠 컨테이너 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="relative">
            {/* 회전 상태 표시 */}
            {isSpinning && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                🎲 돌리는 중...
              </div>
            )}
            
            {/* 회전 휠 */}
            <div className={`wheel-container relative overflow-hidden h-80 bg-gray-50 rounded-xl border-2 border-gray-200 ${isSpinning ? 'ring-2 ring-amber-300 ring-opacity-50' : ''}`}>
              {/* 중앙 선택 영역 표시 - 투명한 테두리만 */}
              <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-20 border-y-3 border-amber-500 z-10 pointer-events-none">
                {/* 상하 테두리 강조 */}
                <div className="absolute inset-x-0 top-0 h-1 bg-amber-500 shadow-sm"></div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-500 shadow-sm"></div>
              </div>
              
              {/* 상하 그라데이션 마스크 */}
              <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-gray-50 to-transparent z-20 pointer-events-none"></div>
              <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-gray-50 to-transparent z-20 pointer-events-none"></div>
              
              {/* 플레이어 리스트 */}
              <div 
                className={`wheel-items absolute inset-x-0 w-full ${animationClass}`}
                style={{
                  transform: `translateY(-${spinOffset + WHEEL_CENTER - (ITEM_HEIGHT / 2)}px)`,
                  transition: animationClass ? 'transform 4s cubic-bezier(0.17, 0.67, 0.15, 1)' : 'none'
                }}
              >
                {extendedPlayers.map((player, index) => {
                  // 현재 이 아이템이 중앙에 있는지 확인 (디버깅용)
                  const itemTop = index * ITEM_HEIGHT;
                  const itemCenter = itemTop + (ITEM_HEIGHT / 2);
                  const currentTransform = spinOffset + WHEEL_CENTER - (ITEM_HEIGHT / 2);
                  const itemPositionOnScreen = itemCenter + currentTransform;
                  const isWinnerAtCenter = !isSpinning && winner && player === winner && 
                    Math.abs(itemPositionOnScreen - WHEEL_CENTER) < 20;
                  
                  return (
                    <div
                      key={`${player}-${index}`}
                      className={`flex items-center justify-center text-lg font-semibold border-b border-gray-200 transition-all duration-200 ${
                        isWinnerAtCenter 
                          ? 'bg-amber-100 text-amber-800 font-bold' 
                          : 'text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                      style={{ 
                        height: `${ITEM_HEIGHT}px`,
                        boxSizing: 'border-box'
                      }}
                    >
                      <div className="text-center px-4 flex items-center gap-2">
                        <span className="text-xs text-gray-400">#{index % players.length}</span>
                        <span>{isWinnerAtCenter ? `🎉 ${player} 🎉` : player}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 당첨자 표시 */}
        {winner && (
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-6 mb-6 text-center shadow-xl">
            <Trophy className="w-12 h-12 text-white mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-white mb-2">당첨!</h2>
            <p className="text-xl text-white font-semibold">{winner}</p>
            <p className="text-amber-100 mt-2">오늘 커피는 당신이!</p>
          </div>
        )}

        {/* 컨트롤 버튼들 */}
        <div className="space-y-4 mb-6">
          <button
            onClick={selectRandomPlayer}
            disabled={isSpinning || countdown > 0 || players.length === 0}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <RotateCcw className="w-6 h-6" />
            {isSpinning ? '돌리는 중...' : countdown > 0 ? `${countdown}초 후 시작` : '돌리기'}
          </button>

          <div className="flex gap-3">
            <button
              onClick={resetGame}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              초기화
            </button>

            <button
              onClick={() => setShowStats(!showStats)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              통계
            </button>
          </div>
        </div>

        {/* 참가자 관리 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-6 h-6" />
              참가자 ({players.length}명)
            </h3>
            <button
              onClick={addPlayer}
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg shadow-md transform transition-all duration-200 hover:scale-105"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {players.map((player, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={() => handleNameEdit(index, tempName)}
                    onKeyPress={(e) => e.key === 'Enter' && handleNameEdit(index, tempName)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => startEdit(index)}
                    className="flex-1 cursor-pointer hover:text-amber-600 font-medium"
                  >
                    {player}
                  </span>
                )}

                <button
                  onClick={() => removePlayer(index)}
                  className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 통계 */}
        {showStats && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                게임 통계
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAllStats(!showAllStats)}
                  className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-colors"
                >
                  {showAllStats ? '현재만' : '전체'}
                </button>
                <button
                  onClick={clearHistory}
                  className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition-colors"
                >
                  초기화
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              총 게임 수: {gameHistory.length}게임
            </div>

            <div className="space-y-3">
              {(showAllStats ? Object.keys(stats) : players)
                .filter(player => showAllStats || players.includes(player))
                .map(player => {
                  const playerStats = stats[player] || { wins: 0, winRate: 0, totalGames: gameHistory.length };
                  return (
                    <div key={player} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {player.charAt(player.length - 1)}
                        </div>
                        <span className="font-medium">{player}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{playerStats.wins}승</div>
                        <div className="text-sm text-gray-600">{playerStats.winRate}%</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* 게임 기록 옵션 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">기록하지 않기</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dontRecord}
                onChange={(e) => setDontRecord(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-11 h-6 rounded-full ${dontRecord ? 'bg-amber-500' : 'bg-gray-300'} transition-colors`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${dontRecord ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
              </div>
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            활성화하면 이번 게임 결과가 통계에 기록되지 않습니다.
          </p>
        </div>
      </div>
    </div>
  );
} 