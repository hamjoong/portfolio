import api from '@/utils/api';
import { ApiResponse } from '@/types/auth';

/**
 * 관리자 전용 API 호출을 담당하는 서비스입니다.
 */
export const adminService = {
  /**
   * 대시보드 요약 통계를 조회합니다.
   */
  async getDashboardStats(): Promise<Record<string, any>> {
    const response = await api.get<ApiResponse<Record<string, any>>>('/admin/dashboard/stats');
    return response.data.data;
  },

  /**
   * 주문 상태를 변경합니다.
   */
  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await api.patch<ApiResponse<void>>(`/admin/orders/${orderId}/status?status=${status}`);
  },
};
