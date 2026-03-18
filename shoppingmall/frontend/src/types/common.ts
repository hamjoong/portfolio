/**
 * Spring Boot의 Pageable API 응답을 처리하기 위한 공통 인터페이스입니다.
 */
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // 현재 페이지 번호
  first: boolean;
  last: boolean;
  empty: boolean;
}
