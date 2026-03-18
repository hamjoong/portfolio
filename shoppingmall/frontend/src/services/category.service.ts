import api from '@/utils/api';
import { ApiResponse } from '@/types/auth';

export interface Category {
  id: number;
  name: string;
  parent?: Category;
  children: Category[];
  displayOrder: number;
}

/**
 * 카테고리 관련 API 호출을 전담하는 서비스입니다.
 */
export const categoryService = {
  /**
   * 전체 카테고리 목록을 조회합니다.
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  },
};
