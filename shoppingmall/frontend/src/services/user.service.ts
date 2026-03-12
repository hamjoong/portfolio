import api from '@/utils/api';
import { UserProfile, Address, AddressRequest, ApiResponse } from '@/types/auth';

/**
 * 사용자 프로필 정보 및 배송지를 관리하는 서비스입니다.
 * [이유] 마이페이지나 프로필 수정 등 사용자 정보를 조회하고
 * 업데이트하는 로직을 통합하여 관리하기 위함입니다.
 */
export const userService = {
  /**
   * 본인의 프로필 정보를 조회합니다.
   * [이유] KMS 복호화를 거친 사용자 실명과 연락처를 획득하기 위함입니다.
   */
  async getMyProfile(): Promise<UserProfile> {
    const response = await api.get<ApiResponse<UserProfile>>('/users/me');
    return response.data.data;
  },

  /**
   * 본인의 프로필 정보를 수정합니다.
   * [이유] 변경된 정보를 백엔드에 전달하여 KMS 기반으로 업데이트하기 위함입니다.
   */
  async updateProfile(data: Omit<UserProfile, 'email'>): Promise<string> {
    const response = await api.patch<ApiResponse<string>>('/users/me', data);
    return response.data.data;
  },

  /**
   * 본인의 배송지 목록을 조회합니다.
   */
  async getMyAddresses(): Promise<Address[]> {
    const response = await api.get<ApiResponse<Address[]>>('/users/me/addresses');
    return response.data.data;
  },

  /**
   * 새로운 배송지를 등록합니다.
   */
  async addAddress(data: AddressRequest): Promise<string> {
    const response = await api.post<ApiResponse<string>>('/users/me/addresses', data);
    return response.data.data;
  },

  /**
   * 배송지 정보를 수정합니다.
   */
  async updateAddress(addressId: string, data: AddressRequest): Promise<void> {
    await api.put<ApiResponse<void>>(`/users/me/addresses/${addressId}`, data);
  },

  /**
   * 배송지를 삭제합니다.
   */
  async deleteAddress(addressId: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/users/me/addresses/${addressId}`);
  },
};
