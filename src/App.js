import React, { useState, useEffect, useCallback } from 'react';
import { Coffee, Users, RotateCcw, BarChart3, Trophy, Calendar, UserPlus, X } from 'lucide-react';

const BIN_ID = process.env.REACT_APP_JSONBIN_BIN_ID;
const API_KEY = "$2a$10$DnO/7.T9TYW8KlXg1lhoRu4jxMaIw6jmmgwf5DPMLI/l2fBDLkEKu";
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export default function CoffeeGame() {
  const [players, setPlayers] = useState(['참가자 1', '참가자 2', '참가자 3', '참가자 4', '참가자 5']);
  const [winner, setWinner] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempName, setTempName] = useState('');
  const [currentHighlight, setCurrentHighlight] = useState(-1);
  const [countdown, setCountdown] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showAllStats, setShowAllStats] = useState(false);
  const [dontRecord, setDontRecord] = useState(false);

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

  const saveGameResult = (winnerName) => {
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
  };

  const clearHistory = () => {
    if (window.confirm('모든 게임 기록을 삭제하시겠습니까?')) {
      setGameHistory([]);
    }
  };

  const addPlayer = () => {
    setPlayers(prev => [...prev, `참가자 ${prev.length + 1}`]);
  };

  const removePlayer = (indexToRemove) => {
    // Prevent removing the last player
    if (players.length <= 1) {
      alert('최소 1명의 참가자는 있어야 합니다.');
      return;
    }
    const playerToRemove = players[indexToRemove];
    if (window.confirm(`'${playerToRemove}' 참가자를 삭제하시겠습니까?`)) {
      setPlayers(prev => prev.filter((_, index) => index !== indexToRemove));
    }
  };

  const selectRandomPlayer = useCallback(() => {
    if (players.length === 0) return;

    // 참가자 목록을 랜덤으로 섞기 (Fisher-Yates shuffle)
    const shuffledPlayers = [...players];
    for (let i = shuffledPlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
    }
    setPlayers(shuffledPlayers);

    setIsSpinning(true);
    setWinner(null);
    setCountdown(3);

    const startSpinning = () => {
      const finalWinnerIndex = Math.floor(Math.random() * shuffledPlayers.length);
      let currentIndex = 0;
      const minSpins = 25;
      const extraSpins = Math.floor(Math.random() * 16);
      const totalSpins = minSpins + extraSpins;
      const targetIndex = totalSpins % shuffledPlayers.length;
      const adjustment = (finalWinnerIndex - targetIndex + shuffledPlayers.length) % shuffledPlayers.length;
      const finalSpinCount = totalSpins + adjustment;

      let speed = 50;
      let spinsCompleted = 0;

      const spin = (index) => {
        setCurrentHighlight(index);
        spinsCompleted++;

        const progress = spinsCompleted / finalSpinCount;
        if (progress > 0.9) speed += 100;
        else if (progress > 0.8) speed += 60;
        else if (progress > 0.6) speed += 30;
        else if (progress > 0.4) speed += 15;
        else if (progress > 0.2) speed += 8;
        else speed += 2;

        if (spinsCompleted < finalSpinCount) {
          const nextIndex = (index + 1) % shuffledPlayers.length;
          setTimeout(() => spin(nextIndex), speed);
        } else {
          setWinner(shuffledPlayers[index]);
          setIsSpinning(false);
          if (!dontRecord) {
            saveGameResult(shuffledPlayers[index]);
          }
        }
      };
      spin(currentIndex);
    };

    // 카운트다운 효과
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
  }, [players, dontRecord, saveGameResult]);
  
  const handleNameEdit = (index, newName) => {
    if (newName.trim()) {
      const newPlayers = [...players];
      newPlayers[index] = newName.trim();
      setPlayers(newPlayers);
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
    setIsSpinning(false);
    setCurrentHighlight(-1);
    setCountdown(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <Coffee className="w-10 h-10 text-amber-600 mr-2" />
            <h1 className="text-3xl font-bold text-amber-800">커피내기</h1>
          </div>
          <p className="text-amber-700">누가 커피를 사게 될까요?</p>
          
          {/* 통계/추가 버튼 */}
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              통계보기
            </button>
            <button
              onClick={addPlayer}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              참가자 추가
            </button>
            <div className="flex items-center justify-center mt-2">
              <input
                type="checkbox"
                id="dontRecord"
                checked={dontRecord}
                onChange={(e) => setDontRecord(e.target.checked)}
                className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
              />
              <label htmlFor="dontRecord" className="ml-2 text-sm font-medium text-gray-900">
                기록X
              </label>
            </div>
          </div>
        </div>

        {/* 통계 섹션 */}
        {showStats && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Trophy className="w-5 h-5 text-yellow-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">게임 통계</h2>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showAllStats"
                  checked={showAllStats}
                  onChange={() => setShowAllStats(!showAllStats)}
                  className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
                />
                <label htmlFor="showAllStats" className="ml-2 text-sm font-medium text-gray-700">
                  모두 보기
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                총 게임 수: <span className="font-bold text-blue-600">{gameHistory.length}회</span>
              </p>
            </div>
            
            <div className="space-y-3">
              {(showAllStats 
                ? Object.keys(stats).sort((a, b) => (stats[b].wins - stats[a].wins) || a.localeCompare(b)) 
                : players
              ).map((player, index) => {
                const playerStats = stats[player] || { wins: 0, winRate: 0 };
                const isTopPlayer = Object.values(stats).length > 0 && 
                  playerStats.wins === Math.max(...Object.values(stats).map(s => s.wins));
                
                return (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border-2 ${
                      isTopPlayer && playerStats.wins > 0 
                        ? 'border-yellow-300 bg-yellow-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        {isTopPlayer && playerStats.wins > 0 && '👑 '}{player}
                      </span>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">
                          {playerStats.wins}회 ({playerStats.winRate}%)
                        </span>
                      </div>
                    </div>
                    
                    {/* 진행률 바 */}
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isTopPlayer && playerStats.wins > 0 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ 
                          width: gameHistory.length > 0 ? `${playerStats.winRate}%` : '0%' 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* 최근 게임 기록 */}
            {gameHistory.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center mb-3">
                  <Calendar className="w-4 h-4 text-gray-600 mr-2" />
                  <h3 className="font-semibold text-gray-800">최근 게임 기록</h3>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {gameHistory.slice(-10).reverse().map((game, index) => (
                    <div key={game.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <span className="text-gray-600">{game.date} {game.time}</span>
                      <span className="font-medium text-red-600">{game.winner} ☕</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 카운트다운 */}
        {countdown > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center">
              <span className="text-6xl font-bold text-amber-600 animate-pulse">
                {countdown}
              </span>
            </div>
          </div>
        )}

        {/* 결과 표시 */}
        {winner && !isSpinning && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6 text-center">
            <Coffee className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-red-700 mb-2">🎉 결과 발표! 🎉</h3>
            <p className="text-lg text-red-600 mb-2">
              <span className="font-bold text-xl">{winner}</span>님이
            </p>
            <p className="text-lg text-red-600 font-semibold">
              커피를 사주세요! ☕
            </p>
          </div>
        )}

        {/* 게임 버튼들 */}
        <div className="space-y-3">
          <button 
            onClick={selectRandomPlayer}
            disabled={isSpinning || players.length === 0}
            className="relative w-full flex items-center justify-center px-8 py-4 bg-amber-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            <RotateCcw className={`w-6 h-6 mr-3 ${isSpinning ? 'animate-spin' : ''}`} />
            돌리기
          </button>

          {winner && !isSpinning && (
            <button
              onClick={resetGame}
              className="w-full py-3 px-6 rounded-xl font-medium border-2 border-amber-500 text-amber-600 hover:bg-amber-50 transition-colors duration-200"
            >
              다시 하기
            </button>
          )}
        </div>
        
        {/* 참가자 목록 */}
        <div className="mt-8 space-y-3">
          {players.map((player, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                (isSpinning || winner) && currentHighlight === index
                  ? 'bg-amber-300 scale-110 shadow-lg'
                  : isSpinning
                  ? 'bg-white opacity-70'
                  : 'bg-white'
              }`}
            >
              {editingIndex === index ? (
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={() => handleNameEdit(index, tempName)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleNameEdit(index, tempName);
                    }
                  }}
                  className="flex-grow bg-transparent focus:outline-none text-lg"
                  autoFocus
                />
              ) : (
                <div className="flex items-center flex-grow" onDoubleClick={() => startEdit(index)}>
                  <Users className="w-5 h-5 mr-3 text-amber-500 flex-shrink-0" />
                  <span className="font-medium text-lg text-gray-800 truncate">
                    {player}
                  </span>
                </div>
              )}
              
              <button 
                onClick={() => removePlayer(index)}
                className="ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors flex-shrink-0"
                aria-label={`${player} 삭제`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* 버전 정보 */}
        {process.env.REACT_APP_VERSION && (
          <div className="text-center text-xs text-gray-500 mt-8">
            Version {process.env.REACT_APP_VERSION}
          </div>
        )}
      </div>
    </div>
  );
}
