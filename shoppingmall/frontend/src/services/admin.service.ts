import api from '@/utils/api';
import { ApiResponse, AdminUserResponse } from '@/types/auth';
import { ProductResponse } from '@/types/product';
import { Page } from '@/types/common';

/**
 * 어드민 전용 API 호출을 담당하는 서비스입니다.
 * 모든 요청 헤더에 자동으로 JWT 토큰이 포함됩니다.
 */
export const adminService = {
  /**
   * 모든 사용자 목록을 페이지별로 조회합니다.
   * @param page - 페이지 번호
   * @param size - 페이지당 항목 수
   */
  async getAllUsers(page: number = 0, size: number = 20): Promise<Page<AdminUserResponse>> {
    const response = await api.get<ApiResponse<Page<AdminUserResponse>>>(`/admin/users?page=${page}&size=${size}`);
    return response.data.data;
  },

  /**
   * 모든 상품 목록을 페이징하여 조회합니다.
   */
  async getAllProducts(page: number = 0, size: number = 20): Promise<Page<ProductResponse>> {
    const response = await api.get<ApiResponse<Page<ProductResponse>>>(`/admin/products?page=${page}&size=${size}`);
    return response.data.data;
  },

  /**
   * 대시보드 통계를 조회합니다.
   */
  async getDashboardStats(): Promise<any> {
    const response = await api.get<ApiResponse<any>>('/admin/stats');
    return response.data.data;
  },

  /**
   * 주문 상태를 업데이트합니다.
   * [수정] 백엔드와 일치하게 PATCH 메서드와 쿼리 파라미터를 사용합니다.
   */
  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await api.patch(`/admin/orders/${orderId}/status?status=${status}`);
  }
};
