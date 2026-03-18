package com.projectx.auth.service;

import com.projectx.auth.domain.entity.Product;
import com.projectx.auth.domain.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
public class OrderConcurrencyTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductRepository productRepository;

    @Test
    @DisplayName("동시에 100명이 주문을 시도할 때, 낙관적 락에 의해 재고 정합성이 유지되어야 한다.")
    void stockConcurrencyTest() throws InterruptedException {
        // 1. 초기 재고 100개인 상품 준비
        Product product = productRepository.save(Product.builder()
                .name("동시성 테스트 상품")
                .price(new BigDecimal("10000"))
                .stockQuantity(100)
                .build());
        
        UUID productId = product.getId();
        int threadCount = 100;
        ExecutorService executorService = Executors.newFixedThreadPool(32);
        CountDownLatch latch = new CountDownLatch(threadCount);
        
        AtomicInteger successCount = new AtomicInteger();
        AtomicInteger failCount = new AtomicInteger();

        // 2. 100개의 스레드에서 동시에 주문 시도
        for (int i = 0; i < threadCount; i++) {
            executorService.submit(() -> {
                try {
                    // 가상의 사용자 ID로 주문 생성
                    orderService.createOrder(UUID.randomUUID(), productId, 1, 
                            "테스터", "01012345678", "서울", "상세주소");
                    successCount.incrementAndGet();
                } catch (ObjectOptimisticLockingFailureException e) {
                    // 낙관적 락 충돌 발생 (정상적인 제어 상황)
                    failCount.incrementAndGet();
                } catch (Exception e) {
                    failCount.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();

        // 3. 결과 검증
        Product updatedProduct = productRepository.findById(productId).orElseThrow();
        
        System.out.println("성공 횟수: " + successCount.get());
        System.out.println("실패 횟수: " + failCount.get());
        System.out.println("남은 재고: " + updatedProduct.getStockQuantity());

        // 재고는 0 이상이어야 하며, (초기재고 - 성공횟수)와 일치해야 함
        assertThat(updatedProduct.getStockQuantity()).isGreaterThanOrEqualTo(0);
        assertThat(updatedProduct.getStockQuantity()).isEqualTo(100 - successCount.get());
    }
}
