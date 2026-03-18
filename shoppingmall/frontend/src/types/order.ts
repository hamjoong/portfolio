export interface OrderItemResponse {
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
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'SHIPPING' | 'DELIVERED';
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
