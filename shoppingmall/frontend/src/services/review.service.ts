import api from '@/utils/api';
import { ApiResponse } from '@/types/auth';
import { Page } from '@/types/common';
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

  async getProductReviews(productId: string, page = 0, size = 10): Promise<Page<Review>> {
    const response = await api.get<ApiResponse<Page<Review>>>(`/reviews/product/${productId}?page=${page}&size=${size}`);
    return response.data.data;
  },

  async getMyReviews(page = 0, size = 10): Promise<Page<Review>> {
    const response = await api.get<ApiResponse<Page<Review>>>(`/reviews/me?page=${page}&size=${size}`);
    return response.data.data;
  },

  // 2. Q&A 관련
  async createQna(data: ProductQnaRequest): Promise<string> {
    const response = await api.post<ApiResponse<string>>('/qnas', data);
    return response.data.data;
  },

  async getProductQnas(productId: string, page = 0, size = 10): Promise<Page<ProductQna>> {
    const response = await api.get<ApiResponse<Page<ProductQna>>>(`/qnas/product/${productId}?page=${page}&size=${size}`);
    return response.data.data;
  },

  async getMyQnas(page = 0, size = 10): Promise<Page<ProductQna>> {
    const response = await api.get<ApiResponse<Page<ProductQna>>>(`/qnas/me?page=${page}&size=${size}`);
    return response.data.data;
  },

  // 3. 관리자 전용
  async replyReview(reviewId: string, content: string): Promise<void> {
    await api.post(`/reviews/${reviewId}/reply`, { content });
  },

  async answerQna(qnaId: string, content: string): Promise<void> {
    await api.post(`/qnas/${qnaId}/answer`, { content });
  },
};
