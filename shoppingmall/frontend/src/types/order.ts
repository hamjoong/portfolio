export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface OrderResponse {
  id: string;
  orderNo: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'SHIPPED' | 'COMPLETED';
  receiverName: string;
  phone: string;
  address: string;
  detailAddress: string;
  createdAt: string;
  orderItems: OrderItemResponse[];
}

export interface ShippingInfoResponse {
  receiverName: string;
  phone: string;
  address: string;
  detailAddress: string;
}

export interface CreateOrderRequest {
  receiverName: string;
  phone: string;
  address: string;
  detailAddress: string;
  /** 선택한 모든 주문 상품. 가격은 보내지 않고 서버가 계산합니다. */
  items: { productId: string; quantity: number; optionId?: string }[];
  /** 비회원 주문에만 필요합니다. 이후 주문 조회에 사용합니다. */
  guestEmail?: string;
  guestLookupPassword?: string;
}

export interface CreateOrderResult {
  orderId: string;
  orderNo: string;
}
