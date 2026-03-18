'use client';

import React from 'react';
import { Star, CornerDownRight, Send, PenLine } from 'lucide-react';

interface ReviewSectionProps {
  reviews?: any[];
  isAdmin: boolean;
  onWrite: () => void;
  onReplySubmit: (id: string, content: string) => void;
  isPending: boolean;
  replyTarget: { id: string } | null;
  setReplyTarget: (target: any) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
}

export function ReviewSection({ 
  reviews, isAdmin, onWrite, onReplySubmit, isPending, 
  replyTarget, setReplyTarget, replyContent, setReplyContent 
}: ReviewSectionProps) {
  return (
    <section className="mb-24 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          상품 리뷰 <span className="text-blue-600 text-sm">{reviews?.length || 0}</span>
        </h2>
        <button 
          onClick={onWrite}
          className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
        >
          <PenLine size={16} />
          리뷰 작성하기
        </button>
      </div>
      
      {reviews && reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">{review.content}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-400 font-medium">구매자 {review.userId?.substring(0, 4) || 'Unknown'}***</span>
                <span className="text-xs text-gray-300 font-medium">
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '-'}
                </span>
              </div>

              {review.adminReply && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border-l-4 border-blue-600">
                  <div className="flex items-center gap-2 mb-2">
                    <CornerDownRight size={14} className="text-blue-600" />
                    <span className="text-xs font-black text-blue-600">판매자 답변</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{review.adminReply}</p>
                </div>
              )}

              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-gray-50">
                  {replyTarget?.id === review.id ? (
                    <div className="space-y-2">
                      <textarea
                        className="w-full p-3 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="리뷰에 대한 감사 인사나 안내 사항을 적어주세요."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setReplyTarget(null)} className="px-3 py-1.5 text-[10px] font-bold text-gray-400">취소</button>
                        <button 
                          onClick={() => onReplySubmit(review.id, replyContent)}
                          disabled={isPending}
                          className="px-3 py-1.5 text-[10px] font-bold bg-blue-600 text-white rounded-md flex items-center gap-1"
                        >
                          <Send size={10} /> 등록
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setReplyTarget({ id: review.id });
                        setReplyContent(review.adminReply || '');
                      }}
                      className="text-[10px] font-bold text-blue-600 hover:underline"
                    >
                      {review.adminReply ? '답변 수정하기' : '답변 달기'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 bg-gray-50 rounded-3xl text-center text-gray-400 font-medium">
          아직 작성된 리뷰가 없습니다.
        </div>
      )}
    </section>
  );
}
