'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick }) => {
  return (
    <section className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center px-8 md:px-16">
      <div className="relative z-10 max-w-lg text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
          가장 앞선 쇼핑 경험,<br />Hjuk Shopping Mall
        </h1>
        <p className="text-blue-100 text-lg mb-8">
          실시간 검색과 빠른 배송으로 완성되는<br />당신만의 라이프스타일 큐레이션.
        </p>
        <button 
          onClick={onExploreClick}
          className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg"
        >
          지금 둘러보기
        </button>
      </div>
      <div className="absolute right-0 bottom-0 opacity-20 hidden md:block">
        <Sparkles className="w-96 h-96" />
      </div>
    </section>
  );
};
