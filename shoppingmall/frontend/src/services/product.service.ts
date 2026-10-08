import catalogApi from '@/utils/catalogApi';
import { ProductResponse, PageResponse } from '@/types/product';
import { ApiResponse } from '@/types/auth';

/**
 * 상품 관련 API 호출을 전담하는 서비스입니다.
 */
export const productService = {
  /**
   * 전체 상품 목록을 페이징 처리하여 조회합니다.
   */
  async getProducts(page = 0, size = 10): Promise<PageResponse<ProductResponse>> {
    try {
      const response = await catalogApi.get<ApiResponse<PageResponse<ProductResponse>>>(`/products?page=${page}&size=${size}`);
      
      // 팩트 체크: API 응답이 성공이고 데이터가 존재하는지 확인
      if (!response.data || !response.data.data) {
        console.error("[CRITICAL] Product API response is malformed:", response.data);
        throw new Error("API response structure is invalid");
      }
      
      return response.data.data;
    } catch (error) {
      console.error("[CRITICAL] ProductService.getProducts failed:", error);
      throw error;
    }
  },

  /**
   * 키워드를 기반으로 PostgreSQL 상품을 검색합니다.
   */
  async searchProducts(keyword: string, page = 0, size = 10): Promise<ProductResponse[]> {
    const response = await catalogApi.get<ApiResponse<ProductResponse[]>>(`/products/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
    return response.data.data;
  },

  /**
   * 실시간 인기 검색어를 조회합니다.
   */
  async getPopularKeywords(): Promise<string[]> {
    const response = await catalogApi.get<ApiResponse<string[]>>('/products/popular-keywords');
    return response.data.data;
  },

  /**
   * 카테고리별 상품 목록을 조회합니다.
   */
  async getProductsByCategory(
    categoryId: number, 
    page = 0, 
    size = 10, 
    sort = 'createdAt,desc',
    minPrice?: number,
    maxPrice?: number
  ): Promise<PageResponse<ProductResponse>> {
    let url = `/products/category/${categoryId}?page=${page}&size=${size}&sort=${sort}`;
    if (minPrice !== undefined) url += `&minPrice=${minPrice}`;
    if (maxPrice !== undefined) url += `&maxPrice=${maxPrice}`;
    
    const response = await catalogApi.get<ApiResponse<PageResponse<ProductResponse>>>(url);
    return response.data.data;
  },

  /**
   * 상품 상세 정보를 조회합니다.
   */
  async getProduct(id: string): Promise<ProductResponse> {
    const response = await catalogApi.get<ApiResponse<ProductResponse>>(`/products/${id}`);
    return response.data.data;
  },

  /**
   * 인기 상품(HOT) 목록을 조회합니다.
   */
  async getTrendingProducts(): Promise<ProductResponse[]> {
    const response = await catalogApi.get<ApiResponse<ProductResponse[]>>('/products/trending');
    return response.data.data;
  },
};
