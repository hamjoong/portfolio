import api from '@/utils/api';
import { ApiResponse } from '@/types/auth';
import { Page } from '@/types/common';
import { ShippingInfoResponse } from '@/types/order';

/**
 * 주문 관련 API 호출을 전담하는 서비스입니다.
 */
export const orderService = {
  /**
   * 신규 주문을 생성합니다.
   */
  async createOrder(
    receiverName: string,
    phone: string,
    address: string,
    detailAddress: string,
    productId?: string, 
    quantity?: number
  ): Promise<string> {
    let url = `/orders?receiverName=${encodeURIComponent(receiverName)}&phone=${encodeURIComponent(phone)}&address=${encodeURIComponent(address)}&detailAddress=${encodeURIComponent(detailAddress)}`;

    if (productId && quantity) {
      url += `&productId=${productId}&quantity=${quantity}`;
    }

    const response = await api.post<ApiResponse<string>>(url);
    return response.data.data;
  },

  /**
   * 가장 최근 배송 정보를 조회합니다.
   */
  async getRecentShippingInfo(): Promise<any> {
    const response = await api.get<ApiResponse<any>>('/orders/recent-shipping');
    return response.data.data;
  },

  /**
   * 본인의 주문 내역을 조회합니다.
   */
  async getMyOrders(page = 0, size = 10): Promise<Page<any>> {
    const response = await api.get<ApiResponse<Page<any>>>(`/orders/me?page=${page}&size=${size}`);
    return response.data.data;
  },

  /**
   * 특정 주문의 상세 내역을 조회합니다.
   */
  async getOrder(orderId: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/orders/${orderId}`);
    return response.data.data;
  }
};
