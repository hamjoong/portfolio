package com.projectx.auth.service;

import com.projectx.auth.domain.entity.Product;
import com.projectx.auth.domain.repository.OutboxRepository;
import com.projectx.auth.domain.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 복합 시나리오 기반 주문 통합 테스트입니다.
 */
@SpringBootTest
class OrderServiceScenarioTest {

    @Autowired private OrderService orderService;
    @MockBean private ProductRepository productRepository;
    @MockBean private OutboxRepository outboxRepository;
    @MockBean private CartService cartService;

    @Test
    @DisplayName("재고가 부족할 경우 주문이 실패하고 Outbox 이벤트는 저장되지 않아야 한다.")
    void createOrder_InsufficientStock_Rollback() {
        // given
        UUID userId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        // 장바구니 모드 테스트를 위해 productId를 null로 전달할 예정이므로 장바구니 설정
        when(cartService.getCartItems(userId)).thenReturn(java.util.Map.of(productId.toString(), 10));
        
        Product product = mock(Product.class);
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        doThrow(new RuntimeException("재고 부족")).when(product).removeStock(10);

        // when & then
        // [수정] 변경된 시그니처 (userId, productId, quantity, receiverName, phone, address, detailAddress)에 맞춰 인자 전달
        // 장바구니 전체 주문 테스트의 경우 productId와 quantity에 null 전달
        assertThatThrownBy(() -> orderService.createOrder(userId, null, null, "홍길동", "01012345678", "서울시 강남구", "101호"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("재고 부족");

        verify(outboxRepository, never()).save(any());
    }
}
