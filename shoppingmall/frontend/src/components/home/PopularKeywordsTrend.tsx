'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';

interface PopularKeywordsTrendProps {
  keywords: string[];
}

export const PopularKeywordsTrend: React.FC<PopularKeywordsTrendProps> = ({ keywords }) => {
  if (!keywords || keywords.length === 0) return null;

  return (
    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-red-500" />
        <h2 className="text-lg font-bold text-gray-900">지금 뜨는 키워드</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <span
            key={keyword}
            className="px-4 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-full border border-gray-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-all"
          >
            <span className="text-blue-500 mr-1">{index + 1}</span> {keyword}
          </span>
        ))}
      </div>
    </section>
  );
};
