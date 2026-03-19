package com.projectx.auth.dto;

import lombok.*;

import java.util.UUID;

/**
 * 배송지 생성 및 수정을 위한 요청 DTO입니다.
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AddressRequest {

    private String addressName;
    private String receiverName;
    private String phoneNumber;
    private String zipCode;
    private String baseAddress;
    private String detailAddress;
    private boolean isDefault;
}
