package com.projectx.auth.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * 사용자의 배송지 정보를 저장하는 엔티티입니다.
 * [이유] 한 명의 사용자가 여러 개의 배송지를 관리할 수 있도록 하고, 
 * 기본 배송지 설정을 통해 주문 시 편의성을 제공하기 위함입니다.
 */
@Entity
@Table(name = "addresses", indexes = {
    @Index(name = "idx_address_user_default", columnList = "userId, isDefault")
})
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Address extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 50)
    private String addressName; // 예: 우리집, 회사

    @Column(nullable = false, length = 50)
    private String receiverName;

    @Column(nullable = false, length = 20)
    private String phoneNumber;

    @Column(nullable = false, length = 10)
    private String zipCode;

    @Column(nullable = false, length = 255)
    private String baseAddress;

    @Column(nullable = false, length = 255)
    private String detailAddress;

    @Column(nullable = false)
    @Builder.Default
    private boolean isDefault = false;

    /**
     * 기본 배송지 여부를 업데이트합니다.
     */
    public void updateDefault(boolean isDefault) {
        this.isDefault = isDefault;
    }

    /**
     * 배송지 상세 정보를 수정합니다.
     */
    public void updateAddress(String addressName, String receiverName, String phoneNumber, 
                              String zipCode, String baseAddress, String detailAddress) {
        this.addressName = addressName;
        this.receiverName = receiverName;
        this.phoneNumber = phoneNumber;
        this.zipCode = zipCode;
        this.baseAddress = baseAddress;
        this.detailAddress = detailAddress;
    }
}
