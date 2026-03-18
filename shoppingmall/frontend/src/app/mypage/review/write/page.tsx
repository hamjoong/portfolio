'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { reviewService } from '@/services/review.service';
import { productService } from '@/services/product.service';
import { ProductResponse } from '@/types/product';
import { Button } from '@/components/common/Button';
import { Star, ArrowLeft, Send, ImageIcon } from 'lucide-react';
import { useReview } from '@/hooks/useReview';

function ReviewWriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const orderId = searchParams.get('orderId');

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const { useCreateReview } = useReview();
  const createReviewMutation = useCreateReview();

  useEffect(() => {
    if (!productId || !orderId) {
      alert('주문 정보가 유효하지 않습니다.');
      router.back();
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await productService.getProduct(productId);
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
  }, [productId, orderId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }

    createReviewMutation.mutate({
      productId: productId!,
      orderId: orderId!,
      rating,
      content,
    }, {
      onSuccess: () => {
        alert('리뷰가 성공적으로 등록되었습니다.');
        router.push(`/product/${productId}`);
      },
      onError: (error) => {
        console.error('Failed to submit review:', error);
        alert('리뷰 등록에 실패했습니다.');
      }
    });
  };

  if (isLoading) return <div className="p-20 text-center font-bold text-gray-400">정보를 불러오는 중...</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          돌아가기
        </button>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-gray-900 mb-2">구매 후기 작성</h1>
            <p className="text-gray-500 font-medium">작성해주신 리뷰는 다른 구매자들에게 큰 도움이 됩니다.</p>
          </div>

          {product && (
            <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl mb-10 border border-gray-100">
              <div className="relative w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                <Image 
                  src={product.mainImageUrl || '/img/placeholder.png'} 
                  alt={product.name} 
                  fill
                  className="object-cover" 
                />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1">Purchased Item</p>
                <h3 className="text-base font-bold text-gray-900 truncate">{product.name}</h3>
                <p className="text-xs text-gray-400 mt-1">주문번호: {orderId?.slice(0, 8)}...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 별점 선택 */}
            <div className="flex flex-col items-center gap-4 py-8 bg-blue-50/30 rounded-3xl border border-blue-50">
              <span className="text-sm font-black text-gray-900 uppercase tracking-widest">How was it?</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star 
                      size={40} 
                      className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                    />
                  </button>
                ))}
              </div>
              <span className="text-lg font-black text-blue-600">
                {rating === 5 ? '최고예요!' : rating === 4 ? '좋아요' : rating === 3 ? '보통이에요' : rating === 2 ? '그저 그래요' : '별로예요'}
              </span>
            </div>

            {/* 리뷰 내용 */}
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-700 ml-1 uppercase tracking-wider">Review Details</label>
              <textarea 
                className="w-full min-h-[180px] bg-white border-2 border-gray-50 rounded-2xl p-6 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                placeholder="상품에 대한 솔직한 후기를 들려주세요 (품질, 디자인, 배송 등)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            {/* 안내 문구 */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-[11px] text-gray-400 leading-relaxed font-medium">
              <p>• 리뷰 운영 방침에 반하는 불건전하거나 상품과 무관한 내용은 비공개될 수 있습니다.</p>
              <p>• 사진을 포함하여 상세하게 작성할 수록 포인트 적립 혜택이 커질 수 있습니다. (준비 중)</p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-16 shadow-xl shadow-blue-100 text-lg"
              isLoading={createReviewMutation.isPending}
            >
              <div className="flex items-center justify-center gap-2">
                <Send size={24} />
                리뷰 등록하기
              </div>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ReviewWritePage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">로딩 중...</div>}>
      <ReviewWriteContent />
    </Suspense>
  );
}
