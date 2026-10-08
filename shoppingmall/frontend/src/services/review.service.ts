import reviewApi from '@/utils/reviewApi';
import qnaApi from '@/utils/qnaApi';
import { ApiResponse } from '@/types/auth';
import { Page } from '@/types/common';
import { Review, ReviewRequest, ProductQna } from '@/types/review';

/**
 * 리뷰 및 Q&A 관련 API 호출을 담당하는 서비스입니다 (Supabase Edge Function 호출).
 */
export const reviewService = {
  // 1. 리뷰 관련
  async createReview(data: ReviewRequest): Promise<string> {
    const response = await reviewApi.post<ApiResponse<string>>('/', data);
    return response.data.data;
  },

  async getProductReviews(productId: string, page = 0, size = 10): Promise<Page<Review>> {
    const response = await reviewApi.get<ApiResponse<Page<Review>>>(`/product/${productId}?page=${page}&size=${size}`);
    return normalizeReviewPage(response.data.data);
  },

  async getProductQnas(productId: string, page = 0, size = 10): Promise<Page<ProductQna>> {
    const response = await qnaApi.get<ApiResponse<Page<ProductQna>>>(`/product/${productId}?page=${page}&size=${size}`);
    return normalizeQnaPage(response.data.data);
  },

  // 2. 관리자 전용
  async replyReview(reviewId: string, content: string): Promise<void> {
    await reviewApi.post(`/${reviewId}/reply`, { content });
  },

  async answerQna(qnaId: string, content: string): Promise<void> {
    await qnaApi.post(`/${qnaId}/answer`, { content });
  },
};

function normalizeReviewPage(page: Page<Review>): Page<Review> {
  return {
    ...page,
    content: page.content.map((review) => {
      const row = review as Review & {
        user_id?: string;
        product_id?: string;
        image_url?: string;
        created_at?: string;
        admin_reply?: string;
        replied_at?: string;
      };
      return {
        ...row,
        userId: row.userId ?? row.user_id ?? '',
        productId: row.productId ?? row.product_id ?? '',
        imageUrl: row.imageUrl ?? row.image_url,
        createdAt: row.createdAt ?? row.created_at ?? '',
        adminReply: row.adminReply ?? row.admin_reply,
        repliedAt: row.repliedAt ?? row.replied_at,
      };
    }),
  };
}

function normalizeQnaPage(page: Page<ProductQna>): Page<ProductQna> {
  return {
    ...page,
    content: page.content.map((qna) => {
      const row = qna as ProductQna & {
        user_id?: string;
        product_id?: string;
        is_answered?: boolean;
        product_name?: string;
        product_image_url?: string;
        created_at?: string;
      };
      return {
        ...row,
        userId: row.userId ?? row.user_id ?? '',
        productId: row.productId ?? row.product_id ?? '',
        productName: row.productName ?? row.product_name ?? '',
        productImageUrl: row.productImageUrl ?? row.product_image_url,
        isAnswered: row.isAnswered ?? row.is_answered ?? false,
        createdAt: row.createdAt ?? row.created_at ?? '',
      };
    }),
  };
}
