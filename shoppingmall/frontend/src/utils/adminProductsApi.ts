import { AdminUserResponse, ApiResponse } from '@/types/auth';
import { AdminStats, Page } from '@/types/common';
import { ProductResponse } from '@/types/product';
import { authenticatedSupabaseFetch } from '@/utils/supabaseAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function adminProductsRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!supabaseUrl || !publishableKey) throw new Error('Supabase API 설정이 없습니다.');
  const accessToken = typeof window === 'undefined' ? null : localStorage.getItem('accessToken');
  if (!accessToken) throw new Error('관리자 로그인 세션이 없습니다.');

  const response = await authenticatedSupabaseFetch(
    `${supabaseUrl}/functions/v1/admin-products${path}`,
    accessToken,
    {
      ...init,
      headers: {
        apikey: publishableKey,
      Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
      cache: 'no-store',
    },
  );
  const result = await response.json().catch(() => null) as ApiResponse<T> | null;
  if (!response.ok || result?.success !== true) {
    throw new Error(result?.message || '관리자 상품 요청에 실패했습니다.');
  }
  return result.data;
}

export const adminProductsApi = {
  async isAdmin() {
    return adminProductsRequest<boolean>('/access');
  },
  getStats() {
    return adminProductsRequest<AdminStats>('/stats');
  },
  getUsers(page: number, size: number) {
    return adminProductsRequest<Page<AdminUserResponse>>(`/users?page=${page}&size=${size}`);
  },
  getOrders(page: number, size: number) {
    return adminProductsRequest<Page<AdminOrderResponse>>(`/orders?page=${page}&size=${size}`);
  },
  updateOrderStatus(orderId: string, status: AdminOrderStatus) {
    return adminProductsRequest<void>(
      `/orders/${encodeURIComponent(orderId)}/status?status=${encodeURIComponent(status)}`,
      { method: 'PATCH' },
    );
  },
  getAll(page: number, size: number) {
    return adminProductsRequest<Page<ProductResponse>>(`/products?page=${page}&size=${size}`);
  },
  getById(productId: string) {
    return adminProductsRequest<ProductResponse>(`/products/${encodeURIComponent(productId)}`);
  },
  create(data: ProductWriteRequest) {
    return adminProductsRequest<string>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update(productId: string, data: ProductWriteRequest) {
    return adminProductsRequest<string>(`/products/${encodeURIComponent(productId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete(productId: string) {
    return adminProductsRequest<void>(`/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    });
  },
};

export type AdminOrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export type AdminOrderResponse = {
  id: string;
  orderNo: string;
  totalAmount: number;
  status: AdminOrderStatus;
  receiverName: string;
  phone: string;
  address: string;
  detailAddress: string;
  createdAt: string;
  orderItems: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }[];
};

export type ProductWriteRequest = {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  categoryId?: number | null;
  options: {
    optionType: string;
    optionName: string;
    additionalPrice: number;
    stockQuantity: number;
  }[];
};
