import React, { useState } from 'react';
import { Coffee, RotateCcw, Zap } from 'lucide-react';
import CoffeeGame from './App';
import CoffeeGame2 from './App2';

export default function AppSelector() {
  const [currentVersion, setCurrentVersion] = useState('v1'); // 기본값을 v1로 설정

  const versions = [
    {
      id: 'v1',
      name: '클래식 버전',
      icon: <RotateCcw className="w-4 h-4" />,
      component: <CoffeeGame />
    },
    {
      id: 'v2', 
      name: 'iOS 스타일',
      icon: <Zap className="w-4 h-4" />,
      component: <CoffeeGame2 />
    }
  ];

  const currentVersionData = versions.find(v => v.id === currentVersion);
  const otherVersion = versions.find(v => v.id !== currentVersion);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 relative">
      {/* 하단 플로팅 토글 버튼 */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={() => setCurrentVersion(otherVersion.id)}
          className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-full px-6 py-3 text-amber-600 hover:bg-amber-50 transition-all duration-300 border border-amber-200/50 flex items-center gap-3 hover:scale-105"
        >
          {otherVersion.icon}
          <span className="text-sm font-semibold">{otherVersion.name}으로 전환</span>
        </button>
      </div>
      
      {/* 선택된 버전 렌더링 */}
      <div className="pt-0 pb-20">
        {currentVersionData?.component}
      </div>
    </div>
  );
} 