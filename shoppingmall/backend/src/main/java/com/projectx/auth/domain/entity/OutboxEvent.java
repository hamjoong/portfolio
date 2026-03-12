package com.projectx.auth.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * 트랜잭션 아웃박스 패턴을 위한 이벤트 엔티티입니다.
 * [이유] 주문 생성 트랜잭션과 외부 메시지 발행(결제 요청, 알림 등)을 원자적으로 묶어
 * 외부 시스템과의 데이터 일관성을 최종적으로 보장하기 위함입니다.
 */
@Entity
@Table(name = "outbox_events", schema = "purchase")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OutboxEvent extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String aggregateType; // 예: ORDER

    @Column(nullable = false, length = 50)
    private String aggregateId; // 예: 주문 ID

    @Column(nullable = false, length = 50)
    private String eventType; // 예: PAYMENT_REQUEST

    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload; // JSON 데이터

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private OutboxStatus status = OutboxStatus.INIT;

    @Builder
    public OutboxEvent(String aggregateType, String aggregateId, String eventType, String payload) {
        this.aggregateType = aggregateType;
        this.aggregateId = aggregateId;
        this.eventType = eventType;
        this.payload = payload;
    }

    public void markAsProcessed() {
        this.status = OutboxStatus.PROCESSED;
    }

    public void markAsFailed() {
        this.status = OutboxStatus.FAILED;
    }
}
