import React from 'react';

/**
 * [Why] SRP(단일 책임 원칙) 준수를 위해 AiReviewPage에서 개별 리포트 카드 렌더링 로직을 분리함.
 * - 특정 모델의 리뷰 결과(점수, 요약, 장단점)를 시각적으로 표현하는 데 집중함.
 */

export interface ConsDetail {
  type: 'performance' | 'security' | 'readability';
  description: string;
  suggestion: string;
  snippet: string;
}

export interface StructuredReview {
  summary: string;
  language: string;
  rating: number;
  pros: string[];
  cons: ConsDetail[];
  error?: string;
}

interface ReviewResultCardProps {
  displayName: string;
  data: StructuredReview;
}

const ReviewResultCard: React.FC<ReviewResultCardProps> = ({ displayName, data }) => {
  if (data.error) {
    return (
      <div className="p-6 bg-red-50 rounded-2xl border border-red-100 text-red-600 mb-6 animate-in fade-in slide-in-from-top-2">
        <h4 className="font-black mb-2 uppercase">{displayName} 분석 오류</h4>
        <p className="text-sm font-medium">{data.error}</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-10 last:mb-0 animate-in fade-in zoom-in-95 duration-300">
      <header className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <h4 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase">
          <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
          {displayName} 리포트
        </h4>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-500 uppercase">{data.language}</span>
          <div className={`px-4 py-1.5 rounded-full text-white font-black text-sm shadow-sm ${getScoreColor(data.rating)}`}>
            SCORE: {data.rating}
          </div>
        </div>
      </header>
      
      <div className="p-8">
        <div className="mb-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-50">
          <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">전체 요약</h5>
          <p className="text-lg font-bold text-slate-700 leading-relaxed">{data.summary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
          {/* 장점 섹션 */}
          <div>
            <h5 className="text-sm font-black text-green-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-[10px]">✓</span> 
              코드 강점
            </h5>
            <ul className="list-none p-0 flex flex-col gap-3">
              {data.pros?.map((pro, i) => (
                <li key={i} className="text-sm font-semibold text-slate-600 bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>

          {/* 개선점 섹션 */}
          <div>
            <h5 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-[10px]">⚠</span> 
              개선 필요 사항
            </h5>
            <div className="flex flex-col gap-4">
              {data.cons?.map((con, i) => (
                <div key={i} className="p-5 bg-blue-50/30 rounded-2xl border border-blue-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-blue-600 text-white rounded-md tracking-wider">{con.type}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 mb-2">{con.description}</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3">{con.suggestion}</p>
                  {con.snippet && (
                    <div className="relative group">
                      <pre className="p-4 bg-slate-900 rounded-xl text-[11px] text-blue-200 font-mono overflow-x-auto border border-slate-800">
                        <code>{con.snippet}</code>
                      </pre>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(con.snippet);
                          alert('코드가 복사되었습니다.');
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 text-white text-[10px] px-2 py-1 rounded border border-white/20 cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ReviewResultCard);
