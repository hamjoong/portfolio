package com.projectx.auth.service;

import com.projectx.auth.domain.entity.Order;
import com.projectx.auth.domain.entity.OrderStatus;
import com.projectx.auth.domain.repository.OrderRepository;
import com.projectx.auth.domain.repository.ProductRepository;
import com.projectx.auth.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 관리자 전용 비즈니스 로직을 담당하는 서비스입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * 관리자 대시보드를 위한 요약 데이터를 조회합니다.
     * [이유] 매출, 주문 수, 회원 수 등 주요 지표를 한눈에 파악하기 위함입니다.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        List<Order> allOrders = orderRepository.findAll();
        
        long totalOrders = allOrders.size();
        BigDecimal totalSales = allOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();

        stats.put("totalOrders", totalOrders);
        stats.put("totalSales", totalSales);
        stats.put("totalUsers", totalUsers);
        stats.put("totalProducts", totalProducts);
        
        return stats;
    }

    /**
     * 주문의 상태를 강제로 변경합니다. (예: 결제완료 -> 배송중)
     */
    @Transactional
    public void updateOrderStatus(UUID orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다."));
        
        order.updateStatus(newStatus);
        log.info("[Admin] Order {} status updated to {}", orderId, newStatus);
    }
}
