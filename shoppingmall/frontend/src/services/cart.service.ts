import api from '@/utils/api';
import { ApiResponse } from '@/types/auth';

/**
 * 장바구니 관련 API 호출을 담당하는 서비스입니다.
 */
export const cartService = {
  /**
   * 장바구니에 상품을 추가합니다.
   */
  async addItem(productId: string, quantity: number, optionId?: string): Promise<void> {
    let url = `/cart?productId=${productId}&quantity=${quantity}`;
    if (optionId) {
      url += `&optionId=${optionId}`;
    }
    await api.post<ApiResponse<void>>(url);
  },

  /**
   * 장바구니 전체 목록을 조회합니다.
   */
  async getCart(): Promise<Record<string, number>> {
    const response = await api.get<ApiResponse<Record<string, number>>>('/cart');
    return response.data.data;
  },

  /**
   * 특정 아이템을 장바구니에서 제거합니다.
   * cartItemId는 "productId" 또는 "productId:optionId" 형식입니다.
   */
  async removeItem(cartItemId: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/cart/${cartItemId}`);
  },

  /**
   * 비회원 장바구니를 회원 장바구니로 통합합니다.
   */
  async mergeCart(guestId: string): Promise<void> {
    await api.post<ApiResponse<void>>(`/cart/merge?guestId=${guestId}`);
  },
};
