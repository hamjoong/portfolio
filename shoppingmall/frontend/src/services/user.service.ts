import { UserProfile, Address, AddressRequest } from '@/types/auth';
import {
  createSupabaseCustomerAddress,
  deleteSupabaseCustomerAddress,
  getSupabaseAuthUser,
  getSupabaseCustomerAddresses,
  getSupabaseCustomerProfile,
  updateSupabaseCustomerAddress,
  updateSupabaseCustomerProfile,
  withdrawSupabaseCustomerAccount,
} from '@/utils/supabaseAuth';

function getSupabaseAccessToken() {
  const token = typeof window === 'undefined' ? null : localStorage.getItem('accessToken');
  if (!token) throw new Error('로그인 세션이 없습니다.');
  return token;
}

/**
 * 사용자 프로필 정보 및 배송지를 관리하는 서비스입니다.
 * 마이페이지나 프로필 수정 등 사용자 정보 조회·변경을 한곳에서 처리합니다.
 */
export const userService = {
  /** 본인의 프로필 정보를 조회합니다. */
  async getMyProfile(): Promise<UserProfile> {
    const accessToken = getSupabaseAccessToken();
    const [profile, user] = await Promise.all([
      getSupabaseCustomerProfile(accessToken),
      getSupabaseAuthUser(accessToken),
    ]);
    return {
      email: user.email ?? '',
      fullName: profile.full_name,
      phoneNumber: profile.phone_number,
      address: profile.address,
      detailAddress: profile.detail_address,
    };
  },

  /** 본인의 프로필 정보를 수정합니다. */
  async updateProfile(data: Omit<UserProfile, 'email'>): Promise<string> {
    await updateSupabaseCustomerProfile(getSupabaseAccessToken(), data);
    return '프로필을 수정했습니다.';
  },

  /** 본인의 배송지 목록을 조회합니다. */
  async getMyAddresses(): Promise<Address[]> {
    const addresses = await getSupabaseCustomerAddresses(getSupabaseAccessToken());
    return addresses.map((address) => ({
      id: address.id,
      addressName: address.address_name,
      receiverName: address.receiver_name,
      phoneNumber: address.phone_number,
      zipCode: address.zip_code,
      baseAddress: address.base_address,
      detailAddress: address.detail_address,
      isDefault: address.is_default,
    }));
  },

  /** 새로운 배송지를 등록합니다. */
  async addAddress(data: AddressRequest): Promise<string> {
    await createSupabaseCustomerAddress(getSupabaseAccessToken(), data);
    return '배송지를 등록했습니다.';
  },

  /** 배송지 정보를 수정합니다. */
  async updateAddress(addressId: string, data: AddressRequest): Promise<void> {
    await updateSupabaseCustomerAddress(getSupabaseAccessToken(), addressId, data);
  },

  /** 배송지를 삭제합니다. */
  async deleteAddress(addressId: string): Promise<void> {
    await deleteSupabaseCustomerAddress(getSupabaseAccessToken(), addressId);
  },

  /** 회원탈퇴를 처리합니다. */
  async withdraw(): Promise<void> {
    await withdrawSupabaseCustomerAccount(getSupabaseAccessToken());
  },
};
