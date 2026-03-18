import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { ProductResponse } from '@/types/product';

/**
 * 실시간 검색 및 인기 검색어를 관리하는 커스텀 훅입니다.
 * [이유] RediSearch를 통한 초고속 검색 결과를 UI에 즉각적으로 반영하고,
 * 인기 검색어 캐싱 및 갱신 로직을 통합하기 위함입니다.
 */
export const useSearch = (keyword: string) => {
  // 1. 실시간 상품 검색 (keyword가 있을 때만 활성화)
  const useProductSearch = () => {
    return useQuery<ProductResponse[]>({
      queryKey: ['productSearch', keyword],
      queryFn: () => productService.searchProducts(keyword),
      enabled: !!keyword && keyword.trim().length > 0,
      staleTime: 1000 * 60 * 5, // 5분 캐싱
    });
  };

  // 2. 실시간 인기 검색어 조회
  const usePopularKeywords = () => {
    return useQuery<string[]>({
      queryKey: ['popularKeywords'],
      queryFn: () => productService.getPopularKeywords(),
      refetchInterval: 1000 * 60 * 10, // 10분마다 갱신
    });
  };

  return {
    useProductSearch,
    usePopularKeywords,
  };
};
