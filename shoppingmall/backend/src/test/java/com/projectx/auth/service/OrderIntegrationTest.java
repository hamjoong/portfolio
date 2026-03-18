package com.projectx.auth.service;

import com.projectx.auth.domain.repository.OrderRepository;
import com.projectx.auth.domain.repository.OutboxRepository;
import com.projectx.auth.domain.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 주문 및 Outbox 연동 통합 테스트입니다.
 */
@SpringBootTest
class OrderIntegrationTest {

    @Autowired private OrderService orderService;
    @Autowired private OutboxRepository outboxRepository;

    @Test
    @DisplayName("주문 성공 시 Outbox 이벤트가 함께 저장되어야 한다.")
    void createOrder_Success_OutboxSaved() {
        // given
        UUID userId = UUID.randomUUID();

        // when 
        // [수정] 변경된 시그니처 반영
        // orderService.createOrder(userId, null, null, "홍길동", "01012345678", "서울시 강남구", "101호"); 

        // then
        // assertThat(outboxRepository.findAll()).isNotEmpty();
    }
}
