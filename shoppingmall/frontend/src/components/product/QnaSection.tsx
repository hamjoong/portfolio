'use client';

import React from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { ProductQna } from '@/types/review';

interface QnaSectionProps {
  qnas?: ProductQna[];
  isAdmin: boolean;
  onWrite: () => void;
  onReplySubmit: (id: string, content: string) => void;
  isPending: boolean;
  replyTarget: { id: string } | null;
  setReplyTarget: (target: { id: string } | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
}

export function QnaSection({
  qnas, isAdmin, onWrite, onReplySubmit, isPending,
  replyTarget, setReplyTarget, replyContent, setReplyContent
}: QnaSectionProps) {
  return (
    <section className="mb-24 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          상품 문의 <span className="text-blue-600 text-sm">{qnas?.length || 0}</span>
        </h2>
        <button 
          onClick={onWrite}
          className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
        >
          <MessageSquare size={16} />
          문의하기
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        {qnas && qnas.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {qnas.map((qna) => (
              <div key={qna.id} className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  {qna.isAnswered ? (
                    <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded uppercase">답변완료</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-400 text-[10px] font-black px-2 py-0.5 rounded uppercase">답변대기</span>
                  )}
                  <span className="text-sm font-bold text-gray-900">{qna.title}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4 pl-0">{qna.content}</p>
                
                {qna.answer && (
                  <div className="bg-gray-50 p-4 rounded-xl flex gap-3 mt-4">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0">A</div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">{qna.answer}</p>
                      <span className="text-[10px] text-gray-400 mt-2 block">Project X CS Team</span>
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <div className="mt-4 pt-4 border-t border-gray-50">
                    {replyTarget?.id === qna.id ? (
                      <div className="space-y-2">
                        <textarea
                          className="w-full p-3 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                          placeholder="문의사항에 대한 정확한 답변을 입력해주세요."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setReplyTarget(null)} className="px-3 py-1.5 text-[10px] font-bold text-gray-400">취소</button>
                          <button 
                            onClick={() => onReplySubmit(qna.id, replyContent)}
                            disabled={isPending}
                            className="px-3 py-1.5 text-[10px] font-bold bg-blue-600 text-white rounded-md flex items-center gap-1"
                          >
                            <Send size={10} /> 답변 등록
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          setReplyTarget({ id: qna.id });
                          setReplyContent(qna.answer || '');
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:underline"
                      >
                        {qna.isAnswered ? '답변 수정하기' : '답변하기'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400 font-medium">문의 사항이 없습니다.</div>
        )}
      </div>
    </section>
  );
}
