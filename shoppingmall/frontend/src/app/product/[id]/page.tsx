'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { useCart } from '@/hooks/useCart';
import { useReview } from '@/hooks/useReview';
import { useOrder } from '@/hooks/useOrder';
import { useAuthStore } from '@/store/useAuthStore';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ReviewSection } from '@/components/product/ReviewSection';
import { QnaSection } from '@/components/product/QnaSection';

type TabType = '상세정보' | '리뷰' | 'Q&A';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>('상세정보');
  const [replyTarget, setReplyTarget] = useState<{ id: string } | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id as string),
    enabled: !!id,
  });

  const { useAddToCart } = useCart();
  const addToCartMutation = useAddToCart();
  const { useProductReviews, useProductQnas, useAddReviewReply, useAddQnaAnswer } = useReview();
  const { data: reviews } = useProductReviews(id as string);
  const { data: qnas } = useProductQnas(id as string);
  const { useMyOrders } = useOrder();
  const { data: orders } = useMyOrders();
  const { role } = useAuthStore();
  
  const addReviewReplyMutation = useAddReviewReply();
  const addQnaAnswerMutation = useAddQnaAnswer();

  const handleAddToCart = () => {
    addToCartMutation.mutate({ productId: id as string, quantity }, {
      onSuccess: () => confirm('장바구니에 담겼습니다. 장바구니로 이동할까요?') && router.push('/cart')
    });
  };

  const handleReviewWrite = () => {
    const purchased = orders?.content?.find((o: any) => 
      (o.status === 'PAID' || o.status === 'PENDING') && 
      o.orderItems?.some((i: any) => i.productId?.toLowerCase() === (id as string).toLowerCase())
    );
    if (!purchased) return alert('상품을 구매하신 분만 리뷰를 작성할 수 있습니다.');
    router.push(`/mypage/review/write?productId=${id}&orderId=${purchased.id}`);
  };

  const handleAdminReply = (targetId: string, content: string, type: 'review' | 'qna') => {
    if (!content.trim()) return;
    if (type === 'review') {
      addReviewReplyMutation.mutate({ reviewId: targetId, reply: content }, {
        onSuccess: () => {
          setReplyTarget(null);
          setReplyContent('');
          alert('리뷰 답글이 등록되었습니다.');
        }
      });
    } else {
      addQnaAnswerMutation.mutate({ qnaId: targetId, answer: content }, {
        onSuccess: () => {
          setReplyTarget(null);
          setReplyContent('');
          alert('문의 답변이 등록되었습니다.');
        }
      });
    }
  };

  if (isLoading || !product) return <div className="h-screen flex items-center justify-center">상품 정보를 불러오는 중...</div>;

  return (
    <div className="flex flex-col gap-12 max-w-6xl mx-auto py-8 px-4">
      <ProductInfo 
        product={product} quantity={quantity} setQuantity={setQuantity} 
        onAddToCart={handleAddToCart} 
        onBuyNow={() => router.push(`/order?productId=${product.id}&quantity=${quantity}`)}
        reviewCount={reviews?.totalElements || 0}
      />

      <div className="border-t border-gray-100 pt-12">
        <div className="flex gap-8 border-b border-gray-100 mb-12 overflow-x-auto no-scrollbar">
          {(['상세정보', '리뷰', 'Q&A'] as TabType[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-lg font-bold transition-colors relative flex-shrink-0 ${activeTab === tab ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
            </button>
          ))}
        </div>

        {activeTab === '상세정보' && (
          <section className="mb-24 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold mb-8">상품 상세 정보</h2>
            <div className="prose max-w-none text-gray-600 leading-relaxed bg-gray-50 p-8 rounded-3xl">
              <p className="whitespace-pre-wrap">{product.description}</p>
            </div>
          </section>
        )}

        {activeTab === '리뷰' && (
          <ReviewSection 
            reviews={reviews?.content} isAdmin={role === 'ROLE_ADMIN'} onWrite={handleReviewWrite} 
            onReplySubmit={(tid, c) => handleAdminReply(tid, c, 'review')}
            isPending={addReviewReplyMutation.isPending}
            replyTarget={replyTarget} setReplyTarget={setReplyTarget}
            replyContent={replyContent} setReplyContent={setReplyContent}
          />
        )}

        {activeTab === 'Q&A' && (
          <QnaSection 
            qnas={qnas?.content} isAdmin={role === 'ROLE_ADMIN'} onWrite={() => router.push(`/mypage/qna/write?productId=${id}`)}
            onReplySubmit={(tid, c) => handleAdminReply(tid, c, 'qna')}
            isPending={addQnaAnswerMutation.isPending}
            replyTarget={replyTarget} setReplyTarget={setReplyTarget}
            replyContent={replyContent} setReplyContent={setReplyContent}
          />
        )}
      </div>
    </div>
  );
}
