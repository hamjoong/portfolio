import qnaApi from '@/utils/qnaApi';
import { ApiResponse } from '@/types/auth';

export interface QnaResponse {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
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

/**
 * 상품 Q&A 서비스 (Supabase Edge Function 호출)
 */
export const qnaService = {
  async createQna(data: QnaRequest): Promise<ApiResponse<string>> {
    const response = await qnaApi.post<ApiResponse<string>>('/', data);
    return response.data;
  },

  async getMyQnas(): Promise<ApiResponse<QnaResponse[]>> {
    const response = await qnaApi.get<ApiResponse<unknown>>('/me');
    return { ...response.data, data: normalizeQnas(response.data.data) };
  },

};

function normalizeQnas(value: unknown): QnaResponse[] {
  const rows = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.content)
      ? value.content
      : null;
  if (!rows) throw new Error('Q&A 목록 응답 형식이 올바르지 않습니다.');

  return rows.map((item) => {
    if (!isRecord(item)) throw new Error('Q&A 항목 응답 형식이 올바르지 않습니다.');
    const product = isRecord(item.product) ? item.product : {};
    const answer = item.answer;
    return {
      id: stringValue(item.id),
      productId: stringValue(item.productId ?? item.product_id),
      productName: stringValue(item.productName ?? item.product_name ?? product.name),
      productImageUrl: optionalString(item.productImageUrl ?? item.product_image_url ?? product.main_image_url),
      title: stringValue(item.title),
      content: stringValue(item.content),
      answer: optionalString(answer),
      isAnswered: typeof item.isAnswered === 'boolean'
        ? item.isAnswered
        : typeof item.is_answered === 'boolean'
          ? item.is_answered
          : Boolean(answer),
      createdAt: stringValue(item.createdAt ?? item.created_at),
    };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
