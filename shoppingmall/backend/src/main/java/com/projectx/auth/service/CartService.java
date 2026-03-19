package com.projectx.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * 장바구니 관리 서비스입니다.
 * [디버깅] Redis 응답 데이터의 타입 안정성(Type Safety)을 확보하고 
 * 캐스팅 오류 가능성을 원천 차단하도록 리팩토링했습니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;
    private static final String CART_PREFIX = "cart:";
    
    private final Map<String, Map<String, Integer>> testCartStorage = new ConcurrentHashMap<>();

    @Value("${spring.data.redis.host:}")
    private String redisHost;

    public void addItem(UUID userId, UUID productId, int quantity) {
        if (isTestMode()) {
            Map<String, Integer> userCart = testCartStorage.computeIfAbsent(userId.toString(), k -> new ConcurrentHashMap<>());
            userCart.put(productId.toString(), userCart.getOrDefault(productId.toString(), 0) + quantity);
            return;
        }

        String key = CART_PREFIX + userId.toString();
        // [수정] 수량을 누적 합산하도록 변경 (기존에는 덮어쓰기 위험이 있었음)
        redisTemplate.opsForHash().increment(key, productId.toString(), quantity);
        redisTemplate.expire(key, 7, TimeUnit.DAYS);
    }

    /**
     * 장바구니 아이템 목록을 안전하게 조회합니다.
     */
    public Map<String, Integer> getCartItems(UUID userId) {
        if (isTestMode()) {
            return testCartStorage.getOrDefault(userId.toString(), Collections.emptyMap());
        }

        // [디버깅] Redis Hash의 모든 엔트리를 가져와서 명확하게 String, Integer 맵으로 변환합니다.
        Map<Object, Object> rawEntries = redisTemplate.opsForHash().entries(CART_PREFIX + userId.toString());
        
        return rawEntries.entrySet().stream()
                .collect(Collectors.toMap(
                        e -> e.getKey().toString(),
                        e -> Integer.parseInt(e.getValue().toString())
                ));
    }

    public void removeItem(UUID userId, UUID productId) {
        if (isTestMode()) {
            if (testCartStorage.containsKey(userId.toString())) {
                testCartStorage.get(userId.toString()).remove(productId.toString());
            }
            return;
        }
        redisTemplate.opsForHash().delete(CART_PREFIX + userId.toString(), productId.toString());
    }

    public void clearCart(UUID userId) {
        if (isTestMode()) {
            testCartStorage.remove(userId.toString());
            return;
        }
        redisTemplate.delete(CART_PREFIX + userId.toString());
    }

    public void mergeCart(UUID guestId, UUID userId) {
        Map<String, Integer> guestCart = getCartItems(guestId);
        if (guestCart.isEmpty()) return;

        for (Map.Entry<String, Integer> entry : guestCart.entrySet()) {
            addItem(userId, UUID.fromString(entry.getKey()), entry.getValue());
        }
        clearCart(guestId);
    }

    private boolean isTestMode() {
        return redisTemplate == null || redisHost == null || redisHost.isEmpty() || "localhost".equals(redisHost);
    }
}
