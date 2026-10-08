import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/review.service';
import { ReviewRequest } from '@/types/review';

/**
 * 리뷰 및 Q&A 기능을 관리하는 커스텀 훅입니다.
 */
export const useReview = () => {
  const queryClient = useQueryClient();

  // 1. 상품 리뷰 조회
  const useProductReviews = (productId: string) => {
    return useQuery({
      queryKey: ['reviews', productId],
      queryFn: () => reviewService.getProductReviews(productId),
      enabled: !!productId,
    });
  };

  // 2. 리뷰 작성
  const useCreateReview = () => {
    return useMutation({
      mutationFn: (data: ReviewRequest) => reviewService.createReview(data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      },
    });
  };

  // 3. 상품 문의(Q&A) 조회
  const useProductQnas = (productId: string) => {
    return useQuery({
      queryKey: ['qnas', productId],
      queryFn: () => reviewService.getProductQnas(productId),
      enabled: !!productId,
    });
  };

  // 4. 관리자 답변 등록 (리뷰)
  const useAddReviewReply = () => {
    return useMutation({
      mutationFn: (params: { reviewId: string; reply: string }) =>
        reviewService.replyReview(params.reviewId, params.reply),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['reviews'] }); // Invalidate all reviews to reflect reply
      },
    });
  };

  // 5. 관리자 답변 등록 (Q&A)
  const useAddQnaAnswer = () => {
    return useMutation({
      mutationFn: (params: { qnaId: string; answer: string }) =>
        reviewService.answerQna(params.qnaId, params.answer),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['qnas'] }); // Invalidate all qnas to reflect answer
      },
    });
  };

  return {
    useProductReviews,
    useCreateReview,
    useProductQnas,
    useAddReviewReply,
    useAddQnaAnswer,
  };
};
