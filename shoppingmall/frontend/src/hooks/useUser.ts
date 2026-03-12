import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { UserProfile, Address, AddressRequest } from '@/types/auth';

/**
 * 사용자 정보와 배송지를 관리하는 커스텀 훅입니다.
 * [이유] 데이터 페칭, 캐싱, 동기화 로직(React Query)을 한 곳에서 관리하여
 * 컴포넌트 레벨에서의 복잡도를 줄이고 재사용성을 높이기 위함입니다.
 */
export const useUser = () => {
  const queryClient = useQueryClient();

  // 1. 프로필 정보 조회
  const useProfile = () => {
    return useQuery<UserProfile>({
      queryKey: ['userProfile'],
      queryFn: () => userService.getMyProfile(),
      staleTime: 1000 * 60 * 5, // 5분 동안 신선한 상태 유지
    });
  };

  // 2. 프로필 정보 수정
  const useUpdateProfile = () => {
    return useMutation({
      mutationFn: (data: Omit<UserProfile, 'email'>) => userService.updateProfile(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      },
    });
  };

  // 3. 배송지 목록 조회
  const useAddresses = () => {
    return useQuery<Address[]>({
      queryKey: ['userAddresses'],
      queryFn: () => userService.getMyAddresses(),
    });
  };

  // 4. 배송지 등록
  const useAddAddress = () => {
    return useMutation({
      mutationFn: (data: AddressRequest) => userService.addAddress(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['userAddresses'] });
      },
    });
  };

  // 5. 배송지 수정
  const useUpdateAddress = () => {
    return useMutation({
      mutationFn: ({ addressId, data }: { addressId: string; data: AddressRequest }) =>
        userService.updateAddress(addressId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['userAddresses'] });
      },
    });
  };

  // 6. 배송지 삭제
  const useDeleteAddress = () => {
    return useMutation({
      mutationFn: (addressId: string) => userService.deleteAddress(addressId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['userAddresses'] });
      },
    });
  };

  return {
    useProfile,
    useUpdateProfile,
    useAddresses,
    useAddAddress,
    useUpdateAddress,
    useDeleteAddress,
  };
};
