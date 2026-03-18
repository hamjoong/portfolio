package com.projectx.auth.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 사용자의 주문 정보를 관리하는 엔티티입니다.
 * [이유] 쇼핑몰의 핵심 거래 데이터로서 결제 금액, 주문자, 상태 등을 
 * 영속적으로 보관하여 거래 무결성을 보장하기 위함입니다.
 */
@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_order_user_created", columnList = "userId, createdAt DESC")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String orderNo; // 사람이 읽기 쉬운 주문 번호 (예: 20260311-XXXXX)

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(nullable = false, length = 50)
    private String receiverName;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(nullable = false, length = 255)
    private String detailAddress;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    @Builder
    public Order(String orderNo, UUID userId, BigDecimal totalAmount, String receiverName, String phone, String address, String detailAddress) {
        this.orderNo = orderNo;
        this.userId = userId;
        this.totalAmount = totalAmount;
        this.receiverName = receiverName;
        this.phone = phone;
        this.address = address;
        this.detailAddress = detailAddress;
    }

    /**
     * 주문 총액을 업데이트합니다.
     * [이유] 주문 항목들을 모두 합산한 최종 금액을 엔티티에 반영하여
     * 결제 및 정산 데이터의 정확성을 기하기 위함입니다.
     */
    public void updateTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    /**
     * 주문 상태를 강제로 업데이트합니다.
     */
    public void updateStatus(OrderStatus status) {
        this.status = status;
    }

    /**
     * 결제가 완료되었을 때 상태를 변경합니다.
     */
    public void markAsPaid() {
        this.status = OrderStatus.PAID;
    }

    /**
     * 주문이 취소되었을 때 상태를 변경합니다.
     */
    public void cancel() {
        this.status = OrderStatus.CANCELLED;
    }
}
