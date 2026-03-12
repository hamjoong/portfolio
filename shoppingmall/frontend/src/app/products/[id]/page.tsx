'use client';

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { productService } from '@/services/product.service';
import { cartService } from '@/services/cart.service';
import { qnaService, QnaResponse } from '@/services/qna.service';
import { ProductResponse } from '@/types/product';
import { ShoppingCart, CreditCard, MessageSquare, Lock } from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 특정 상품의 상세 정보를 보여주는 페이지 컴포넌트입니다.
 * [이유] 상품의 세부 특징, 가격, 재고 등을 상세히 설명하여 
 * 사용자가 최종 구매 결정을 내릴 수 있도록 돕기 위함입니다.
 */
export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params); 
  const router = useRouter();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [qnas, setQnas] = useState<QnaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, qnaRes] = await Promise.all([
          productService.getProduct(id),
          qnaService.getProductQnas(id)
        ]);

        if (productRes.success) {
          setProduct(productRes.data);
          
          // 최근 본 상품 추적 로직 추가
          const viewed = localStorage.getItem('recentViewedProducts');
          const viewedList = viewed ? JSON.parse(viewed) : [];
          const updatedList = [
            productRes.data, 
            ...viewedList.filter((p: any) => p.id !== productRes.data.id)
          ].slice(0, 10); // 최대 10개 유지
          localStorage.setItem('recentViewedProducts', JSON.stringify(updatedList));
        }

        if (qnaRes.success) {
          setQnas(qnaRes.data);
        }
      } catch (err) {
        console.error('[ProductDetail] Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  /**
   * 장바구니에 상품을 추가합니다.
   * [이유] 사용자가 선택한 수량만큼 장바구니(Redis)에 저장하고
   * 장바구니 페이지로 이동하여 확인을 돕기 위함입니다.
   */
  const handleAddToCart = async () => {
    if (!product) return;
    setIsSubmitting(true);
    try {
      await cartService.addItem(product.id, quantity);
      alert('장바구니에 상품을 담았습니다.');
      // router.push('/cart'); // [제거] 자동 이동을 막음
    } catch (err) {
      console.error('[ProductDetail] Add to cart failed:', err);
      alert('장바구니 담기에 실패했습니다. 로그인 상태를 확인해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 바로 구매를 수행합니다.
   * [이유] 현재 상품의 ID와 수량 정보를 주문 페이지로 전달하여 
   * 장바구니 전체 구매가 아닌 해당 상품만 즉시 결제할 수 있도록 유도합니다.
   */
  const handleDirectBuy = async () => {
    if (!product) return;
    router.push(`/order?productId=${product.id}&quantity=${quantity}`);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">상품을 찾을 수 없습니다.</div>;

  const formattedPrice = new Intl.NumberFormat('ko-KR', {
    style: 'currency', currency: 'KRW',
  }).format(product.price);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* 이미지 섹션 */}
        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-inner relative">
          <Image 
            src={product.mainImageUrl || '/img/placeholder.png'} 
            alt={product.name} 
            fill
            className="object-cover"
          />
        </div>

        {/* 상세 정보 섹션 */}
        <div className="flex flex-col space-y-8">
          <div className="space-y-2">
            <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">
              {product.categoryName}
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="text-4xl font-bold text-gray-900">
            {formattedPrice}
          </div>

          <div className="border-t border-b py-6 text-gray-600 leading-relaxed">
            {product.description || "상세 설명이 등록되지 않은 상품입니다."}
          </div>

          {/* 수량 및 상태 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 uppercase">수량</span>
            <div className="flex items-center border rounded-lg">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-gray-100 transition-colors"
              >-</button>
              <span className="px-6 font-bold">{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                className="px-4 py-2 hover:bg-gray-100 transition-colors"
              >+</button>
            </div>
          </div>

          {/* 구매/장바구니 버튼 */}
          <div className="grid grid-cols-2 gap-4 pt-6">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full flex gap-2"
              onClick={handleAddToCart}
              isLoading={isSubmitting}
            >
              <ShoppingCart size={20} />
              장바구니
            </Button>
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full flex gap-2 shadow-lg shadow-blue-200"
              onClick={handleDirectBuy}
              isLoading={isSubmitting}
            >
              <CreditCard size={20} />
              바로 구매
            </Button>
          </div>

          <p className="text-sm text-center text-gray-400">
            남은 재고: <span className="font-bold text-gray-600">{product.stockQuantity}</span>개
          </p>
        </div>
      </div>

      {/* 상품 문의 섹션 */}
      <div className="mt-24 border-t pt-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">상품 문의</h2>
            <p className="text-sm text-gray-400 font-bold">궁금한 점을 남겨주시면 정성껏 답변해 드립니다.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push(`/mypage/qna/write?productId=${id}`)}
            className="flex gap-2"
          >
            <MessageSquare size={18} />
            문의하기
          </Button>
        </div>

        {qnas.length > 0 ? (
          <div className="divide-y border-y">
            {qnas.map((qna) => (
              <div key={qna.id} className="py-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {qna.isAnswered ? (
                        <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">답변완료</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-400 text-[10px] font-black px-2 py-0.5 rounded uppercase">답변대기</span>
                      )}
                      <span className="text-xs text-gray-400 font-bold italic">
                        비밀글입니다.
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Lock size={14} className="text-gray-300" />
                      {qna.title}
                    </h3>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gray-400 font-medium">{new Date(qna.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-3xl py-20 text-center border border-dashed border-gray-200">
            <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold">아직 등록된 문의가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
