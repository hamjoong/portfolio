/**
 * 상품 관련 데이터의 타입을 정의하는 파일입니다.
 * [이유] API 응답 구조를 명확히 정의하여 자동 완성 지원 및
 * 컴파일 타임의 타입 안정성을 확보하기 위함입니다.
 */

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryName: string;
  mainImageUrl?: string;
}

/**
 * Spring Data JPA의 Page 응답 형식을 정의합니다.
 */
export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
