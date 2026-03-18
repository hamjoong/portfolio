import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';

/**
 * 장바구니 비즈니스 로직을 관리하는 커스텀 훅입니다.
 */
export const useCart = () => {
  const queryClient = useQueryClient();

  const queryKey = ['cart'];

  // 1. 장바구니 조회 (Query data cannot be undefined 에러 방지)
  const useGetCart = () => useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const data = await cartService.getCart();
        return data || {}; // null/undefined 방지
      } catch (error) {
        console.error("Cart fetch error:", error);
        return {}; // 에러 시 빈 객체 반환
      }
    },
    staleTime: 1000 * 60, // 1분간 유효
  });

  // 2. 수량 변경 및 추가 통합
  const useUpdateCartItem = () => useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartService.addItem(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // [중요] useAddToCart 별칭 추가 (기존 컴포넌트 오류 해결)
  const useAddToCart = useUpdateCartItem;

  // 3. 상품 삭제
  const useRemoveItem = () => useMutation({
    mutationFn: cartService.removeItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  // 4. 장바구니 통합
  const useMerge = () => useMutation({
    mutationFn: cartService.mergeCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    useGetCart,
    useUpdateCartItem,
    useAddToCart,
    useRemoveItem,
    useMerge,
  };
};
