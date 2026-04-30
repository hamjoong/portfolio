package com.hjuk.devcodehub.global.config;

import java.time.Duration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis 캐시 설정 클래스 [Why] - TRD 성능 기준(API 200ms 이하) 충족을 위해 빈번한 조회 요청을 캐싱함. - Redis가 비활성화된 경우 로컬 메모리
 * 캐시(ConcurrentMapCacheManager)로 폴백하여 시스템 안정성을 보장함.
 */
@Configuration
public class CacheConfig {

  private static final int DEFAULT_CACHE_TTL_MINUTES = 10;

  @Bean
  @Primary
  @ConditionalOnProperty(
      name = "app.redis.auto-startup",
      havingValue = "true",
      matchIfMissing = true)
  public CacheManager redisCacheManager(RedisConnectionFactory connectionFactory) {
    RedisCacheConfiguration config =
        RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(DEFAULT_CACHE_TTL_MINUTES))
            .disableCachingNullValues()
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new StringRedisSerializer()))
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new GenericJackson2JsonRedisSerializer()));

    return RedisCacheManager.builder(connectionFactory)
        .cacheDefaults(config)
        .withInitialCacheConfigurations(java.util.Collections.emptyMap())
        .transactionAware()
        .build();
  }

  @Bean
  @ConditionalOnProperty(name = "app.redis.auto-startup", havingValue = "false")
  public CacheManager localCacheManager() {
    return new ConcurrentMapCacheManager();
  }
}
