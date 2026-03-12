package com.projectx.auth.dto;

import com.projectx.auth.domain.entity.Address;
import lombok.*;

import java.util.UUID;

/**
 * 배송지 정보를 반환하기 위한 응답 DTO입니다.
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AddressResponse {

    private UUID id;
    private String addressName;
    private String receiverName;
    private String phoneNumber;
    private String zipCode;
    private String baseAddress;
    private String detailAddress;
    private boolean isDefault;

    /**
     * Entity를 DTO로 변환합니다.
     */
    public static AddressResponse from(Address entity) {
        return AddressResponse.builder()
                .id(entity.getId())
                .addressName(entity.getAddressName())
                .receiverName(entity.getReceiverName())
                .phoneNumber(entity.getPhoneNumber())
                .zipCode(entity.getZipCode())
                .baseAddress(entity.getBaseAddress())
                .detailAddress(entity.getDetailAddress())
                .isDefault(entity.isDefault())
                .build();
    }
}
