package com.projectx.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 최근 배송지 정보를 반환하기 위한 응답 객체입니다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingInfoResponse {
    private String receiverName;
    private String phone;
    private String address;
    private String detailAddress;
}
