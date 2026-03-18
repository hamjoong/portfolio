import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';

/**
 * 관리자 전용 기능을 관리하는 커스텀 훅입니다.
 */
export const useAdmin = () => {
  const queryClient = useQueryClient();

  // 1. 대시보드 통계 조회
  const useDashboardStats = () => {
    return useQuery({
      queryKey: ['adminStats'],
      queryFn: () => adminService.getDashboardStats(),
      refetchInterval: 1000 * 60 * 5, // 5분마다 자동 갱신
    });
  };

  // 2. 주문 상태 변경
  const useUpdateOrderStatus = () => {
    return useMutation({
      mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
        adminService.updateOrderStatus(orderId, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminStats'] });
        queryClient.invalidateQueries({ queryKey: ['allOrders'] }); // 필요 시 전체 주문 목록 캐시 무효화
      },
    });
  };

  return {
    useDashboardStats,
    useUpdateOrderStatus,
  };
};
