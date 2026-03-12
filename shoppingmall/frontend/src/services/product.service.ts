import api from '@/utils/api';
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
    const response = await api.get<ApiResponse<PageResponse<ProductResponse>>>(`/products?page=${page}&size=${size}`);
    return response.data.data;
  },

  /**
   * 상품 업로드를 위한 S3 Presigned URL을 요청합니다.
   */
  async getUploadUrl(fileName: string): Promise<string> {
    const response = await api.get<ApiResponse<string>>(`/products/upload-url?fileName=${fileName}`);
    return response.data.data;
  },

  /**
   * 신규 상품을 등록합니다.
   */
  async createProduct(data: any): Promise<string> {
    const response = await api.post<ApiResponse<string>>('/products', data);
    return response.data.data;
  },

  /**
   * 키워드를 기반으로 상품을 검색합니다. (RediSearch 우선)
   */
  async searchProducts(keyword: string, page = 0, size = 10): Promise<ProductResponse[]> {
    const response = await api.get<ApiResponse<ProductResponse[]>>(`/products/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
    return response.data.data;
  },

  /**
   * 실시간 인기 검색어를 조회합니다.
   */
  async getPopularKeywords(): Promise<string[]> {
    const response = await api.get<ApiResponse<string[]>>('/products/popular-keywords');
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
    
    const response = await api.get<ApiResponse<PageResponse<ProductResponse>>>(url);
    return response.data.data;
  },

  /**
   * 상품 상세 정보를 조회합니다.
   */
  async getProduct(id: string): Promise<ProductResponse> {
    const response = await api.get<ApiResponse<ProductResponse>>(`/products/${id}`);
    return response.data.data;
  },
};
