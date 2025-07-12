import React, { useState, useEffect } from 'react';
import { Coffee, RotateCcw, Zap } from 'lucide-react';
import CoffeeGame from './App';
import CoffeeGame2 from './App2';

export default function AppSelector() {
  const [currentVersion, setCurrentVersion] = useState('v2'); // 기본값을 v2로 설정
  const [showToast, setShowToast] = useState(false);
  const [clickCount, setClickCount] = useState(0);

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

  // 더블클릭으로 버전 전환
  const handleDoubleClick = () => {
    setCurrentVersion(otherVersion.id);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // 토스트 메시지 자동 숨김
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 relative">
      {/* 숨겨진 더블클릭 영역 */}
      <div 
        className="fixed top-4 right-4 w-16 h-16 z-50 cursor-pointer"
        onDoubleClick={handleDoubleClick}
        title="더블클릭하여 버전 전환"
      >
        <div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          {otherVersion.icon}
        </div>
      </div>
      
      {/* 토스트 메시지 */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 bg-white shadow-lg rounded-lg p-4 border border-amber-200 animate-slide-in">
          <div className="flex items-center gap-2 text-sm">
            {currentVersionData.icon}
            <span className="font-semibold text-gray-700">{currentVersionData.name}으로 전환됨</span>
          </div>
        </div>
      )}
      
      {/* 선택된 버전 렌더링 */}
      <div className="pt-0">
        {currentVersionData?.component}
      </div>
    </div>
  );
} 