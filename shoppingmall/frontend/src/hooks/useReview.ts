import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/review.service';
import { ReviewRequest, ProductQnaRequest } from '@/types/review';

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
        queryClient.invalidateQueries({ queryKey: ['myReviews'] });
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

  // 4. 문의 작성
  const useCreateQna = () => {
    return useMutation({
      mutationFn: (data: ProductQnaRequest) => reviewService.createQna(data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['qnas', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['myQnas'] });
      },
    });
  };

  // 5. 내 리뷰 조회
  const useMyReviews = () => {
    return useQuery({
      queryKey: ['myReviews'],
      queryFn: () => reviewService.getMyReviews(),
    });
  };

  // 6. 내 문의 조회
  const useMyQnas = () => {
    return useQuery({
      queryKey: ['myQnas'],
      queryFn: () => reviewService.getMyQnas(),
    });
  };

  return {
    useProductReviews,
    useCreateReview,
    useProductQnas,
    useCreateQna,
    useMyReviews,
    useMyQnas,
  };
};
