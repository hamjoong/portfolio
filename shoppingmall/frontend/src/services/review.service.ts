import api from '@/utils/api';
import { ApiResponse } from '@/types/auth';
import { Review, ReviewRequest, ProductQna, ProductQnaRequest } from '@/types/review';

/**
 * 리뷰 및 Q&A 관련 API 호출을 담당하는 서비스입니다.
 */
export const reviewService = {
  // 1. 리뷰 관련
  async createReview(data: ReviewRequest): Promise<string> {
    const response = await api.post<ApiResponse<string>>('/reviews', data);
    return response.data.data;
  },

  async getProductReviews(productId: string): Promise<Review[]> {
    const response = await api.get<ApiResponse<Review[]>>(`/reviews/product/${productId}`);
    return response.data.data;
  },

  async getMyReviews(): Promise<Review[]> {
    const response = await api.get<ApiResponse<Review[]>>('/reviews/me');
    return response.data.data;
  },

  // 2. Q&A 관련
  async createQna(data: ProductQnaRequest): Promise<string> {
    const response = await api.post<ApiResponse<string>>('/qnas', data);
    return response.data.data;
  },

  async getProductQnas(productId: string): Promise<ProductQna[]> {
    const response = await api.get<ApiResponse<ProductQna[]>>(`/qnas/product/${productId}`);
    return response.data.data;
  },

  async getMyQnas(): Promise<ProductQna[]> {
    const response = await api.get<ApiResponse<ProductQna[]>>('/qnas/me');
    return response.data.data;
  },
};
