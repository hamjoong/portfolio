'use client';

import React, { useEffect, useState } from 'react';
import { qnaService, QnaResponse } from '@/services/qna.service';
import { ArrowLeft, MessageSquare, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function MyQnaPage() {
  const router = useRouter();
  const [qnas, setQnas] = useState<QnaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchQnas = async () => {
      try {
        const response = await qnaService.getMyQnas();
        if (response.success) {
          setQnas(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch QNAs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQnas();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          돌아가기
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <MessageSquare size={32} className="text-blue-600" />
            나의 상품 문의
          </h1>
          <p className="text-gray-500 font-medium mt-2">내가 작성한 문의 내역을 확인하실 수 있습니다.</p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-400 font-bold">로딩 중...</div>
        ) : qnas.length > 0 ? (
          <div className="space-y-4">
            {qnas.map((qna) => (
              <div key={qna.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div 
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(qna.id)}
                >
                  <div className="flex-1 min-w-0 flex items-center gap-4">
                    {/* 상품 이미지 추가 */}
                    {qna.productImageUrl && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 relative">
                        <Image src={qna.productImageUrl} alt={qna.productName} fill className="object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                          {qna.productName}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          {new Date(qna.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-1">
                        {qna.isAnswered ? (
                          <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">답변완료</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">답변대기</span>
                        )}
                        <h3 className="text-base font-bold text-gray-900 truncate">{qna.title}</h3>
                      </div>
                    </div>
                  </div>
                  {expandedId === qna.id ? <ChevronUp size={20} className="text-gray-300" /> : <ChevronDown size={20} className="text-gray-300" />}
                </div>

                {expandedId === qna.id && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-50 bg-gray-50/30">
                    <div className="bg-white p-4 rounded-xl mb-4 border border-gray-100">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{qna.content}</p>
                    </div>
                    
                    {qna.answer ? (
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-black">A</div>
                          <span className="text-xs font-black text-blue-600 uppercase tracking-wider">Project X CS Team</span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{qna.answer}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 font-bold px-2 italic">아직 판매자의 답변을 기다리고 있습니다.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
            <MessageSquare size={64} className="mx-auto text-gray-100 mb-6" />
            <p className="text-gray-400 font-bold text-xl">작성한 문의 내역이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
