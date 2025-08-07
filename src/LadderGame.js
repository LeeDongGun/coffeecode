import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Users, UserPlus, X, Play, RefreshCw } from 'lucide-react';

const BIN_ID = process.env.REACT_APP_JSONBIN_BIN_ID;
const API_KEY = "$2a$10$DnO/7.T9TYW8KlXg1lhoRu4jxMaIw6jmmgwf5DPMLI/l2fBDLkEKu";
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export default function LadderGame() {
  const [players, setPlayers] = useState(['참가자 1', '참가자 2', '참가자 3', '참가자 4']);
  const [results, setResults] = useState(['꽝', '당첨', '꽝', '꽝']);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [editingPlayerIndex, setEditingPlayerIndex] = useState(null);
  const [tempPlayerName, setTempPlayerName] = useState('');
  const [editingResultIndex, setEditingResultIndex] = useState(null);
  const [tempResultName, setTempResultName] = useState('');

  const canvasRef = useRef(null);

  // 데이터 로드
  useEffect(() => {
    const loadGameData = async () => {
      if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE' || !BIN_ID) {
        setIsDataLoaded(true);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/latest`, {
          headers: { 'X-Master-Key': API_KEY },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.record && data.record.players && data.record.players.length > 0) {
            setPlayers(data.record.players);
            // 결과 배열도 플레이어 수에 맞게 초기화
            const initialResults = Array(data.record.players.length).fill('꽝');
            if (initialResults.length > 1) {
              initialResults[1] = '당첨';
            }
            setResults(initialResults);
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

  const addPlayer = () => {
    setPlayers(prev => [...prev, `참가자 ${prev.length + 1}`]);
    setResults(prev => [...prev, '꽝']);
  };

  const removePlayer = (indexToRemove) => {
    if (players.length <= 2) {
      alert('최소 2명의 참가자는 있어야 합니다.');
      return;
    }
    setPlayers(prev => prev.filter((_, index) => index !== indexToRemove));
    setResults(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handlePlayerNameEdit = (index, newName) => {
    if (newName.trim()) {
      const newPlayers = [...players];
      newPlayers[index] = newName.trim();
      setPlayers(newPlayers);
    }
    setEditingPlayerIndex(null);
    setTempPlayerName('');
  };

  const handleResultEdit = (index, newText) => {
    if (newText.trim()) {
      const newResults = [...results];
      newResults[index] = newText.trim();
      setResults(newResults);
    }
    setEditingResultIndex(null);
    setTempResultName('');
  };

  const [ladders, setLadders] = useState([]);

  const generateLadders = useCallback(() => {
    const numPlayers = players.length;
    if (numPlayers < 2) {
      setLadders([]);
      return;
    }

    const newLadders = [];
    const ladderCount = numPlayers * 2; // 가로선 개수 (조정 가능)

    for (let i = 0; i < ladderCount; i++) {
      const startNode = Math.floor(Math.random() * (numPlayers - 1));
      const y = Math.random() * 0.8 + 0.1; // 10% ~ 90% 위치에만

      // 겹치지 않게 추가
      if (!newLadders.some(l => l.startNode === startNode && Math.abs(l.y - y) < 0.1)) {
        newLadders.push({ startNode, y });
      }
    }
    setLadders(newLadders);
  }, [players.length]);

  const drawLadder = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;
    const numPlayers = players.length;
    const stepX = width / (numPlayers + 1);
    const V_PADDING = 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw vertical lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.font = "16px Arial";
    ctx.textAlign = "center";

    for (let i = 0; i < numPlayers; i++) {
      const x = stepX * (i + 1);
      ctx.beginPath();
      ctx.moveTo(x, V_PADDING);
      ctx.lineTo(x, height - V_PADDING);
      ctx.stroke();

      // Draw player names and results
      ctx.fillText(players[i], x, V_PADDING - 10);
      ctx.fillText(results[i], x, height - V_PADDING + 20);
    }

    // Draw horizontal ladders
    ctx.strokeStyle = '#e53e3e'; // red-500
    ladders.forEach(({ startNode, y }) => {
      const x1 = stepX * (startNode + 1);
      const x2 = stepX * (startNode + 2);
      const lineY = V_PADDING + (height - 2 * V_PADDING) * y;
      ctx.beginPath();
      ctx.moveTo(x1, lineY);
      ctx.lineTo(x2, lineY);
      ctx.stroke();
    });

  }, [players, results, ladders]);

  useEffect(() => {
    generateLadders();
  }, [players.length, generateLadders]);

  useEffect(() => {
    drawLadder();
  }, [players, results, ladders, drawLadder]);

  const runTrace = (startIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const numPlayers = players.length;
    const stepX = width / (numPlayers + 1);
    const V_PADDING = 40;

    let currentX = startIndex;
    let currentY = 0; // 0 to 1

    // Sort ladders by y position
    const sortedLadders = [...ladders].sort((a, b) => a.y - b.y);

    ctx.beginPath();
    ctx.moveTo(stepX * (currentX + 1), V_PADDING);
    ctx.strokeStyle = `hsl(${startIndex * 60}, 100%, 50%)`;
    ctx.lineWidth = 4;

    sortedLadders.forEach(({ startNode, y }) => {
      if (y > currentY) {
        if (startNode === currentX) { // Move right
          ctx.lineTo(stepX * (currentX + 1), V_PADDING + (height - 2 * V_PADDING) * y);
          currentX++;
          ctx.lineTo(stepX * (currentX + 1), V_PADDING + (height - 2 * V_PADDING) * y);
          currentY = y;
        } else if (startNode === currentX - 1) { // Move left
          ctx.lineTo(stepX * (currentX + 1), V_PADDING + (height - 2 * V_PADDING) * y);
          currentX--;
          ctx.lineTo(stepX * (currentX + 1), V_PADDING + (height - 2 * V_PADDING) * y);
          currentY = y;
        }
      }
    });

    ctx.lineTo(stepX * (currentX + 1), height - V_PADDING);
    ctx.stroke();

    return currentX; // Final position
  };

  const runAllTraces = () => {
    drawLadder(); // Redraw to clear previous traces
    players.forEach((_, index) => {
      runTrace(index);
    });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">사다리타기 게임</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Player & Result Settings */}
        <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><Users className="mr-2"/>참가자 설정</h2>
          <div className="space-y-2 mb-6">
            {players.map((player, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={player}
                  onChange={(e) => {
                    const newPlayers = [...players];
                    newPlayers[index] = e.target.value;
                    setPlayers(newPlayers);
                  }}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button onClick={() => removePlayer(index)} className="p-2 text-gray-500 hover:text-red-500"><X size={18}/></button>
              </div>
            ))}
          </div>
          <button onClick={addPlayer} className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            <UserPlus size={18}/> 참가자 추가
          </button>

          <hr className="my-6"/>

          <h2 className="text-xl font-semibold mb-4">결과 설정</h2>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={result}
                  onChange={(e) => {
                    const newResults = [...results];
                    newResults[index] = e.target.value;
                    setResults(newResults);
                  }}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Ladder Canvas & Controls */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-center items-center mb-4 gap-4">
            <button onClick={generateLadders} className="flex items-center gap-2 py-3 px-6 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 transition-colors shadow-md">
              <RefreshCw size={20}/> 사다리 다시 그리기
            </button>
            <button onClick={runAllTraces} className="flex items-center gap-2 py-3 px-6 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 transition-colors shadow-md">
              <Play size={20}/> 결과 확인!
            </button>
          </div>
          <canvas ref={canvasRef} width="800" height="600" className="w-full h-auto border-2 border-gray-200 rounded-lg"></canvas>
        </div>
      </div>
    </div>
  );
}
