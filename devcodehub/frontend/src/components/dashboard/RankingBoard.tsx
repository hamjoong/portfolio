import React from 'react';

interface RankingBoardProps {
  users: { id: number; nickname: string; level: number }[];
}

export const RankingBoard: React.FC<RankingBoardProps> = ({ users }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
    <h3 className="text-xl font-bold mb-6 text-slate-900">🏆 개발자 랭킹 (Top 5)</h3>
    <div className="flex flex-col gap-4">
      {users.slice(0, 5).map((u, i) => (
        <div key={u.id} className="flex items-center gap-2">
          <span className={`font-black whitespace-nowrap min-w-[2.5rem] ${i < 3 ? 'text-yellow-500' : 'text-slate-400'}`}>
            {i + 1}위
          </span>
          <span className="font-bold text-slate-900 flex-1 truncate">{u.nickname}</span>
          <span className="text-sm font-black text-blue-600 shrink-0">LV.{u.level}</span>
        </div>
      ))}
    </div>
  </div>
);
