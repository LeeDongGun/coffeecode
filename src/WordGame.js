import React, { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, X, Play, RefreshCw, BrainCircuit, Check, Timer } from 'lucide-react';

const BIN_ID = process.env.REACT_APP_JSONBIN_BIN_ID;
const API_KEY = "$2a$10$DnO/7.T9TYW8KlXg1lhoRu4jxMaIw6jmmgwf5DPMLI/l2fBDLkEKu";
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const TURN_TIMEOUT = 15; // 턴당 제한시간 (초)

export default function WordGame() {
  const [players, setPlayers] = useState(['참가자 1', '참가자 2', '참가자 3', '참가자 4']);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [topic, setTopic] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  const [usedWords, setUsedWords] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameState, setGameState] = useState('waiting'); // waiting, running, over
  const [loser, setLoser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TURN_TIMEOUT);
  const [failReason, setFailReason] = useState('');

  const timerRef = useRef(null);
  const inputRef = useRef(null);

  // 데이터 로드
  useEffect(() => {
    const loadGameData = async () => {
      // ... (데이터 로드 로직은 이전과 동일)
    };
    loadGameData();
  }, []);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setTimeLeft(TURN_TIMEOUT);
  };

  const startTimer = () => {
    resetTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.01) {
          clearInterval(timerRef.current);
          setGameState('over');
          setLoser(players[currentPlayerIndex]);
          setFailReason('시간 초과!');
          return 0;
        }
        return prev - 0.01;
      });
    }, 10);
  };

  const handleStart = () => {
    if (!topic.trim()) {
      alert('주제어를 입력해주세요.');
      return;
    }
    if (players.length < 1) {
      alert('최소 1명의 참가자가 필요합니다.');
      return;
    }
    setGameState('running');
    setUsedWords([]);
    setCurrentWord('');
    setLoser(null);
    setFailReason('');
    setCurrentPlayerIndex(Math.floor(Math.random() * players.length));
    startTimer();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const word = currentWord.trim();
    if (!word) return;

    if (usedWords.map(w => w.toLowerCase()).includes(word.toLowerCase())) {
      setGameState('over');
      setLoser(players[currentPlayerIndex]);
      setFailReason('중복된 단어!');
      resetTimer();
      return;
    }

    setUsedWords(prev => [word, ...prev]);
    setCurrentWord('');
    setCurrentPlayerIndex(prev => (prev + 1) % players.length);
    startTimer();
  };

  const handleReset = () => {
    setGameState('waiting');
    setTopic('');
    resetTimer();
  };

  useEffect(() => {
    if (gameState === 'running' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, currentPlayerIndex]);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const addPlayer = () => setPlayers(prev => [...prev, `참가자 ${prev.length + 1}`]);

  const removePlayer = (indexToRemove) => {
    if (players.length <= 1) {
      alert('최소 1명의 참가자는 있어야 합니다.');
      return;
    }
    setPlayers(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // (UI 부분은 다음 턴에 수정)
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2 flex items-center justify-center gap-3"><BrainCircuit size={32}/> 단어 연상 게임</h1>
      <p className="text-center text-gray-600 mb-6">주제에 맞는 단어를 이어서 말해보세요!</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg min-h-[450px]">
          {gameState === 'waiting' && (
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-2xl font-bold mb-4">게임 설정</h2>
              <div className="w-full mb-6">
                <label htmlFor="topic" className="block text-lg font-medium text-gray-700 mb-2">주제어</label>
                <input
                  id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                  placeholder="예: 동물, 과일, 나라 이름..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-xl"
                />
              </div>
              <button onClick={handleStart} className="flex items-center gap-2 py-3 px-6 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 transition-colors shadow-md">
                <Play size={20}/> 게임 시작
              </button>
            </div>
          )}

          {gameState === 'running' && (
            <form onSubmit={handleSubmit}>
              <div className="text-center mb-6">
                <p className="text-lg text-gray-600">주제어</p>
                <p className="text-4xl font-extrabold text-purple-600">{topic}</p>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  ref={inputRef}
                  type="text" value={currentWord} onChange={(e) => setCurrentWord(e.target.value)}
                  placeholder={`${players[currentPlayerIndex]}님, 단어를 입력하세요`}
                  className="flex-grow px-4 py-3 border-2 border-purple-400 rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button type="submit" className="py-3 px-5 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600">
                  <Check size={24} />
                </button>
              </div>

              <div className="text-center mb-6">
                <p className={`flex items-center justify-center gap-2 text-lg font-semibold transition-colors ${timeLeft < 5 ? 'text-red-600' : 'text-red-400'}`}>
                  <Timer size={20} /> {timeLeft.toFixed(1)}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">사용된 단어 ({usedWords.length}개)</h3>
                <div className="bg-gray-100 p-4 rounded-lg min-h-[150px] max-h-[200px] overflow-y-auto flex flex-wrap gap-2">
                  {usedWords.length > 0 ? usedWords.map((word, i) => (
                    <span key={i} className="bg-gray-300 text-gray-800 px-3 py-1 rounded-full text-sm">{word}</span>
                  )) : (
                    <p className="text-gray-500">아직 사용된 단어가 없습니다.</p>
                  )}
                </div>
              </div>
            </form>
          )}

          {gameState === 'over' && (
            <div className="text-center flex flex-col justify-center items-center h-full">
              <h2 className="text-3xl font-bold text-red-600 mb-4">{failReason}</h2>
              <p className="text-2xl mb-4">패배자는...</p>
              <p className="text-5xl font-extrabold text-blue-600 animate-pulse mb-8">{loser}</p>
              <button onClick={handleReset} className="flex items-center gap-2 py-3 px-6 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 transition-colors shadow-md">
                <RefreshCw size={20}/> 새 게임하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
