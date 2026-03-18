import api from '@/utils/api';
import { ApiResponse } from '@/types/auth';

/**
 * 장바구니 관련 API 호출을 담당하는 서비스입니다.
 */
export const cartService = {
  /**
   * 장바구니에 상품을 추가합니다.
   */
  async addItem(productId: string, quantity: number): Promise<void> {
    await api.post<ApiResponse<void>>(`/cart?productId=${productId}&quantity=${quantity}`);
  },

  /**
   * 장바구니 전체 목록을 조회합니다.
   */
  async getCart(): Promise<Record<string, number>> {
    const response = await api.get<ApiResponse<Record<string, number>>>('/cart');
    return response.data.data;
  },

  /**
   * 특정 상품을 장바구니에서 제거합니다.
   */
  async removeItem(productId: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/cart/${productId}`);
  },

  /**
   * 비회원 장바구니를 회원 장바구니로 통합합니다.
   */
  async mergeCart(guestId: string): Promise<void> {
    await api.post<ApiResponse<void>>(`/cart/merge?guestId=${guestId}`);
  },
};
