import api from '@/utils/api';
import { ApiResponse } from '@/types/auth';

export interface QnaResponse {
  id: string;
  productId: string;
  title: string;
  content: string;
  answer?: string;
  isAnswered: boolean;
  createdAt: string;
}

export interface QnaRequest {
  productId: string;
  title: string;
  content: string;
}

export const qnaService = {
  async createQna(data: QnaRequest): Promise<ApiResponse<string>> {
    const response = await api.post<ApiResponse<string>>('/qnas', data);
    return response.data;
  },

  async getMyQnas(): Promise<ApiResponse<QnaResponse[]>> {
    const response = await api.get<ApiResponse<QnaResponse[]>>('/qnas/me');
    return response.data;
  },

  async getProductQnas(productId: string): Promise<ApiResponse<QnaResponse[]>> {
    const response = await api.get<ApiResponse<QnaResponse[]>>(`/qnas/product/${productId}`);
    return response.data;
  }
};
