package com.projectx.auth.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import software.amazon.awssdk.services.kms.KmsClient;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

/**
 * 테스트 모드(profile=test)에서 외부 인프라 연동을 무력화하기 위한 클래스입니다.
 * [성능 최적화] 런타임 환경에서 Mockito 의존성을 제거하여 안정성을 높였습니다.
 */
@Configuration
@Profile({"test", "mock"})
public class MockConfig {

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new RedisConnectionFactory() {
            @Override public org.springframework.data.redis.connection.RedisConnection getConnection() { return null; }
            @Override public org.springframework.data.redis.connection.RedisClusterConnection getClusterConnection() { return null; }
            @Override public boolean getConvertPipelineAndTxResults() { return false; }
            @Override public org.springframework.data.redis.connection.RedisSentinelConnection getSentinelConnection() { return null; }
            @Override public org.springframework.dao.DataAccessException translateExceptionIfPossible(RuntimeException ex) { return null; }
        };
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory());
        template.setKeySerializer(new StringRedisSerializer());
        return template;
    }

    @Bean
    public KmsClient kmsClient() {
        // 실제 AWS KMS 연동 없이 동작하도록 더미 빈 반환
        return KmsClient.builder().build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        // 실제 AWS S3 연동 없이 동작하도록 더미 빈 반환
        return S3Presigner.builder().build();
    }

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("products", "categories");
    }
}
