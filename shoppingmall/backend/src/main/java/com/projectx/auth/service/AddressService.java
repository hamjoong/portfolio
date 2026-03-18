package com.projectx.auth.service;

import com.projectx.auth.domain.entity.Address;
import com.projectx.auth.domain.repository.AddressRepository;
import com.projectx.auth.dto.AddressRequest;
import com.projectx.auth.dto.AddressResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 사용자의 배송지 정보를 관리하는 서비스입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    /**
     * 특정 사용자의 모든 배송지 정보를 조회합니다.
     */
    @Transactional(readOnly = true)
    public List<AddressResponse> getMyAddresses(UUID userId) {
        return addressRepository.findAllByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(AddressResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 새로운 배송지 정보를 등록합니다.
     * [이유] 등록하려는 배송지가 기본 배송지인 경우 기존의 기본 배송지를 해제해야 합니다.
     */
    @Transactional
    public UUID addAddress(UUID userId, AddressRequest request) {
        if (request.isDefault()) {
            resetDefaultAddress(userId);
        }

        Address address = Address.builder()
                .userId(userId)
                .addressName(request.getAddressName())
                .receiverName(request.getReceiverName())
                .phoneNumber(request.getPhoneNumber())
                .zipCode(request.getZipCode())
                .baseAddress(request.getBaseAddress())
                .detailAddress(request.getDetailAddress())
                .isDefault(request.isDefault())
                .build();

        Address savedAddress = addressRepository.save(address);
        log.info("[Address] New address added for user: {}, addressId: {}", userId, savedAddress.getId());
        return savedAddress.getId();
    }

    /**
     * 배송지 정보를 수정합니다.
     */
    @Transactional
    public void updateAddress(UUID userId, UUID addressId, AddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("배송지 정보를 찾을 수 없습니다."));

        if (!address.getUserId().equals(userId)) {
            throw new RuntimeException("해당 배송지 정보를 수정할 권한이 없습니다.");
        }

        if (request.isDefault() && !address.isDefault()) {
            resetDefaultAddress(userId);
        }

        address.updateAddress(
                request.getAddressName(),
                request.getReceiverName(),
                request.getPhoneNumber(),
                request.getZipCode(),
                request.getBaseAddress(),
                request.getDetailAddress()
        );
        address.updateDefault(request.isDefault());
        
        log.info("[Address] Address updated for user: {}, addressId: {}", userId, addressId);
    }

    /**
     * 배송지 정보를 삭제합니다.
     */
    @Transactional
    public void deleteAddress(UUID userId, UUID addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("배송지 정보를 찾을 수 없습니다."));

        if (!address.getUserId().equals(userId)) {
            throw new RuntimeException("해당 배송지 정보를 삭제할 권한이 없습니다.");
        }

        addressRepository.delete(address);
        log.info("[Address] Address deleted for user: {}, addressId: {}", userId, addressId);
    }

    /**
     * 기존의 기본 배송지 설정을 해제합니다.
     */
    private void resetDefaultAddress(UUID userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(address -> address.updateDefault(false));
    }
}
