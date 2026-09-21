package com.projectx.auth.service;

import com.projectx.auth.domain.entity.Order;
import com.projectx.auth.domain.entity.OrderItem;
import com.projectx.auth.domain.entity.OrderStatus;
import com.projectx.auth.domain.entity.Product;
import com.projectx.auth.domain.repository.OrderRepository;
import com.projectx.auth.domain.repository.ProductRepository;
import com.projectx.auth.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@SpringBootTest
@Transactional
class OrderCancellationTest {

    @Autowired private OrderService orderService;
    @MockitoBean private OrderRepository orderRepository;
    @MockitoBean private ProductRepository productRepository;
    @MockitoBean private MockPaymentService paymentService;

    @Test
    @DisplayName("주문 취소 시 재고가 원복되고 상태가 CANCELLED로 변경되어야 한다.")
    void cancelOrder_Success() {
        // given
        UUID orderId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        
        Order order = Order.builder()
                .orderNo("20260921-TEST")
                .userId(UUID.randomUUID())
                .totalAmount(BigDecimal.TEN)
                .receiverName("tester")
                .phone("010-0000-0000")
                .address("address")
                .detailAddress("detail")
                .build();
        order.updateStatus(OrderStatus.PAID);
        
        OrderItem item = OrderItem.builder()
                .order(order)
                .productId(productId)
                .quantity(2)
                .price(BigDecimal.valueOf(5))
                .build();
        order.getOrderItems().add(item);

        Product product = Product.builder()
                .id(productId)
                .name("test product")
                .price(BigDecimal.valueOf(5))
                .stockQuantity(10)
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(paymentService.refundPayment(orderId)).thenReturn(true);

        // when
        orderService.cancelOrder(orderId);

        // then
        assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(product.getStockQuantity()).isEqualTo(12);
        verify(productRepository, times(1)).save(product);
        verify(paymentService, times(1)).refundPayment(orderId);
    }

    @Test
    @DisplayName("결제 완료 상태가 아닌 경우 취소 시 예외가 발생해야 한다.")
    void cancelOrder_InvalidStatus_Exception() {
        // given
        UUID orderId = UUID.randomUUID();
        Order order = Order.builder()
                .orderNo("20260921-TEST")
                .userId(UUID.randomUUID())
                .build();
        order.updateStatus(OrderStatus.PENDING); // Not PAID

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        // when & then
        assertThatThrownBy(() -> orderService.cancelOrder(orderId))
                .isInstanceOf(BusinessException.class);
    }
}
