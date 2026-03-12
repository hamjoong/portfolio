'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { qnaService } from '@/services/qna.service';
import { productService } from '@/services/product.service';
import { ProductResponse } from '@/types/product';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';

function QnaWriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      alert('상품 정보가 없습니다.');
      router.back();
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await productService.getProduct(productId);
        // Note: productService.getProduct already returns data directly based on previous refactoring
        if (response) {
          setProduct(response);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Note: qnaService should also be checked if it returns data directly
      const response = await qnaService.createQna({
        productId: productId!,
        title: formData.title,
        content: formData.content,
      });

      alert('문의가 등록되었습니다.');
      router.push('/mypage/qna');
    } catch (err) {
      console.error('Failed to submit QNA:', err);
      alert('문의 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-20 text-center font-bold text-gray-400">상품 정보를 불러오는 중...</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          돌아가기
        </button>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
              <MessageSquare size={32} className="text-blue-600" />
              상품 문의하기
            </h1>
            <p className="text-gray-500 font-medium">구매하시려는 혹은 구매하신 상품에 대해 궁금한 점을 적어주세요.</p>
          </div>

          {product && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-10">
              <div className="relative w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                <Image 
                  src={product.mainImageUrl || '/img/placeholder.png'} 
                  alt={product.name} 
                  fill
                  className="object-cover" 
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-black uppercase tracking-tighter">Product</p>
                <h3 className="text-sm font-bold text-gray-900 truncate">{product.name}</h3>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="문의 제목"
              placeholder="제목을 입력하세요"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 ml-1">문의 내용</label>
              <textarea 
                className="w-full min-h-[200px] bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                placeholder="상세 내용을 입력하세요 (배송, 상품 상태, 교환/환불 등)"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-4 mb-6">
              <p className="text-[11px] text-blue-600 font-bold leading-relaxed">
                • 답변이 등록되면 &apos;마이페이지 &gt; 나의 상품 문의&apos;에서 확인하실 수 있습니다.<br />
                • 부적절한 언어나 개인정보 포함 시 삭제될 수 있습니다.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full py-4 shadow-lg shadow-blue-100"
              isLoading={isSubmitting}
            >
              <div className="flex items-center justify-center gap-2">
                <Send size={20} />
                문의 등록하기
              </div>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function QnaWritePage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">로딩 중...</div>}>
      <QnaWriteContent />
    </Suspense>
  );
}
