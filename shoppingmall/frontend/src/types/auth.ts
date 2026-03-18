/**
 * 모든 API 응답의 표준 규격입니다.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface SignupRequest {
  email: string;
  password?: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  detailAddress: string;
}

/**
 * 로그인 성공 시의 상세 데이터 타입입니다.
 */
export interface LoginData {
  userId: string;
  accessToken: string;
  refreshToken?: string;
  role: string;
}

export interface UserProfile {
  email: string;
  fullName: string;
  phoneNumber: string;
  address?: string;
  detailAddress?: string;
}

/**
 * 배송지 정보를 나타내는 타입입니다.
 */
export interface Address {
  id: string;
  addressName: string;
  receiverName: string;
  phoneNumber: string;
  zipCode: string;
  baseAddress: string;
  detailAddress: string;
  isDefault: boolean;
}

/**
 * 배송지 생성 및 수정을 위한 요청 타입입니다.
 */
export interface AddressRequest {
  addressName: string;
  receiverName: string;
  phoneNumber: string;
  zipCode: string;
  baseAddress: string;
  detailAddress: string;
  isDefault: boolean;
}

/**
 * 어드민 페이지에서 사용하는 상세 사용자 정보 타입입니다.
 */
export interface AdminUserResponse {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
  
  // 복호화된 개인 정보
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  detailAddress?: string;
}
