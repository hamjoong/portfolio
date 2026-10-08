import orderApi from '@/utils/orderApi';
import { ApiResponse } from '@/types/auth';
import { Page } from '@/types/common';
import { CreateOrderRequest, CreateOrderResult, OrderResponse, ShippingInfoResponse } from '@/types/order';

/**
 * 주문 관련 API 호출을 전담하는 서비스입니다.
 */
export const orderService = {
  /**
   * 신규 주문을 생성합니다.
   */
  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResult> {
    const response = await orderApi.post<ApiResponse<{ orderId: string; orderNo: string }>>('/', request);
    return response.data.data;
  },

  /**
   * 비회원 주문을 주문번호, 이메일, 조회 비밀번호로 조회합니다.
   * 정보가 하나라도 틀리면 서버는 사유를 구분하지 않고 404를 돌려줍니다.
   */
  async lookupGuestOrder(orderNo: string, email: string, password: string): Promise<OrderResponse> {
    const response = await orderApi.post<ApiResponse<unknown>>('/guest-lookup', { orderNo, email, password });
    return normalizeOrder(response.data.data);
  },

  /**
   * 가장 최근 배송 정보를 조회합니다.
   */
  async getRecentShippingInfo(): Promise<ShippingInfoResponse | null> {
    const response = await orderApi.get<ApiResponse<unknown>>('/recent-shipping');
    if (response.data.data === null) return null;
    const shipping = asRecord(response.data.data);
    return {
      receiverName: stringValue(shipping.receiver_name ?? shipping.receiverName),
      phone: stringValue(shipping.phone ?? shipping.recipient_phone),
      address: stringValue(shipping.address),
      detailAddress: stringValue(shipping.detail_address ?? shipping.detailAddress),
    };
  },

  /**
   * 본인의 주문 내역을 조회합니다.
   */
  async getMyOrders(page = 0, size = 10): Promise<Page<OrderResponse>> {
    const response = await orderApi.get<ApiResponse<unknown>>(`/me?page=${page}&size=${size}`);
    return normalizeOrderPage(response.data.data);
  },

  /**
   * 특정 주문의 상세 내역을 조회합니다.
   */
  async getOrder(orderId: string): Promise<OrderResponse> {
    const response = await orderApi.get<ApiResponse<unknown>>(`/${orderId}`);
    return normalizeOrder(response.data.data);
  },

};

function normalizeOrderPage(value: unknown): Page<OrderResponse> {
  const page = asRecord(value);
  if (!Array.isArray(page.content)) throw new Error('주문 목록 응답 형식이 올바르지 않습니다.');
  const content = page.content.map(normalizeOrder);
  const number = numberValue(page.number ?? asRecord(page.pageable).pageNumber);
  const size = numberValue(page.size ?? asRecord(page.pageable).pageSize);
  const totalElements = numberValue(page.totalElements, content.length);
  const totalPages = numberValue(page.totalPages, size > 0 ? Math.ceil(totalElements / size) : 0);
  return {
    content,
    number,
    size,
    totalElements,
    totalPages,
    first: typeof page.first === 'boolean' ? page.first : number === 0,
    last: typeof page.last === 'boolean' ? page.last : number + 1 >= totalPages,
    empty: typeof page.empty === 'boolean' ? page.empty : content.length === 0,
  };
}

function normalizeOrder(value: unknown): OrderResponse {
  const order = asRecord(value);
  if (!Array.isArray(order.order_items ?? order.orderItems ?? order.items)) {
    throw new Error('주문 항목 응답 형식이 올바르지 않습니다.');
  }
  const items = (order.order_items ?? order.orderItems ?? order.items) as unknown[];
  return {
    id: stringValue(order.id),
    orderNo: stringValue(order.order_no ?? order.orderNo),
    totalAmount: numberValue(order.total_amount ?? order.totalAmount),
    status: stringValue(order.status) as OrderResponse['status'],
    receiverName: stringValue(order.receiver_name ?? order.receiverName),
    phone: stringValue(order.phone ?? order.recipient_phone),
    address: stringValue(order.address),
    detailAddress: stringValue(order.detail_address ?? order.detailAddress),
    createdAt: stringValue(order.created_at ?? order.createdAt),
    orderItems: items.map((value) => {
      const item = asRecord(value);
      const productValue = item.products ?? item.product;
      const product = Array.isArray(productValue)
        ? asRecord(productValue[0])
        : isRecord(productValue)
          ? productValue
          : {};
      return {
        id: stringValue(item.id),
        productId: stringValue(item.product_id ?? item.productId),
        productName: stringValue(item.productName ?? product.name),
        quantity: numberValue(item.quantity),
        price: numberValue(item.price),
        imageUrl: optionalString(item.imageUrl ?? product.main_image_url),
      };
    }),
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw new Error('API 응답 형식이 올바르지 않습니다.');
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function numberValue(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
