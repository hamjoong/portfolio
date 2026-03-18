/**
 * 상품 정보를 나타내는 데이터 타입입니다.
 */
export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryName: string;
  mainImageUrl: string; // 상품 대표 이미지 URL
}

/**
 * 페이지네이션된 상품 목록을 나타내는 데이터 타입입니다.
 */
export interface PageResponse<T> {
  content: T[];
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  totalElements: number;
  totalPages: number;
}

