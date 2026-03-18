import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';

/**
 * 주문 및 결제 흐름을 관리하는 커스텀 훅입니다.
 * [이유] 주문 생성, 최근 배송지 조회 등의 로직을 캡슐화하고
 * 주문 성공 시 장바구니 데이터를 무효화하여 최신 상태를 유지하기 위함입니다.
 */
export const useOrder = () => {
  const queryClient = useQueryClient();

  // 1. 주문 생성
  const useCreateOrder = () => {
    return useMutation({
      mutationFn: (params: {
        receiverName: string;
        phone: string;
        address: string;
        detailAddress: string;
        productId?: string;
        quantity?: number;
      }) =>
        orderService.createOrder(
          params.receiverName,
          params.phone,
          params.address,
          params.detailAddress,
          params.productId,
          params.quantity
        ),
      onSuccess: () => {
        // 주문 성공 시 장바구니와 주문 목록 갱신
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      },
    });
  };

  // 2. 나의 주문 내역 조회
  const useMyOrders = () => {
    return useQuery({
      queryKey: ['myOrders'],
      queryFn: () => orderService.getMyOrders(),
    });
  };

  // 3. 최근 배송 정보 조회
  const useRecentShipping = () => {
    return useQuery({
      queryKey: ['recentShipping'],
      queryFn: () => orderService.getRecentShippingInfo(),
    });
  };

  return {
    useCreateOrder,
    useMyOrders,
    useRecentShipping,
  };
};
