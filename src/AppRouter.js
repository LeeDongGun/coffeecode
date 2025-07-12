import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Coffee, RotateCcw, Zap, Home } from 'lucide-react';
import CoffeeGame from './App';
import CoffeeGame2 from './App2';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-500 rounded-full mb-6 shadow-xl">
          <Coffee className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-amber-800 mb-4">커피 뽑기 게임</h1>
        <p className="text-amber-600 mb-8">사용할 버전을 선택하세요</p>
        
        <div className="space-y-4">
          <NavLink 
            to="/classic"
            className="block bg-white hover:bg-amber-50 border-2 border-amber-200 hover:border-amber-300 rounded-2xl p-6 shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-800">클래식 버전</h3>
                <p className="text-sm text-gray-600">하이라이트 방식의 전통적인 뽑기</p>
              </div>
            </div>
          </NavLink>
          
          <NavLink 
            to="/ios-style"
            className="block bg-white hover:bg-amber-50 border-2 border-amber-200 hover:border-amber-300 rounded-2xl p-6 shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-800">iOS 스타일</h3>
                <p className="text-sm text-gray-600">회전 휠 방식의 모던한 뽑기</p>
              </div>
            </div>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

function Navigation() {
  return (
    <nav className="bg-white shadow-lg border-b border-amber-200 sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 text-amber-600 hover:text-amber-700">
            <Home className="w-5 h-5" />
            <span className="font-semibold">홈</span>
          </NavLink>
          
          <div className="flex gap-4">
            <NavLink 
              to="/classic"
              className={({ isActive }) => 
                `px-3 py-2 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'text-gray-600 hover:text-amber-600'
                }`
              }
            >
              클래식
            </NavLink>
            <NavLink 
              to="/ios-style"
              className={({ isActive }) => 
                `px-3 py-2 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'text-gray-600 hover:text-amber-600'
                }`
              }
            >
              iOS 스타일
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function AppRouter() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/classic" element={
            <>
              <Navigation />
              <CoffeeGame />
            </>
          } />
          <Route path="/ios-style" element={
            <>
              <Navigation />
              <CoffeeGame2 />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
} 