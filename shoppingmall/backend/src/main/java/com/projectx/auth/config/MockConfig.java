package com.projectx.auth.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.connection.RedisClusterConnection;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisSentinelConnection;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.dao.DataAccessException;
import software.amazon.awssdk.services.kms.KmsClient;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import org.mockito.Mockito;

/**
 * mock 프로파일(로컬 개발 환경)에서 외부 인프라 연동을 무력화하기 위한 클래스입니다.
 * [수정] Mockito mock 기반의 RedisConnectionFactory는 Spring의 afterPropertiesSet()
 * 초기화 검증을 통과하지 못하므로, 익명 클래스로 교체하여 애플리케이션 기동 오류를 해결합니다.
 */
@Configuration
@Profile({"test", "mock"})
public class MockConfig {

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        // [수정] Mockito 대신 익명 클래스로 가짜 ConnectionFactory를 구현합니다.
        // Mockito mock은 Spring의 afterPropertiesSet() 검증에서 IllegalStateException을 발생시킵니다.
        return new RedisConnectionFactory() {
            @Override public RedisConnection getConnection() { return null; }
            @Override public RedisClusterConnection getClusterConnection() { return null; }
            @Override public boolean getConvertPipelineAndTxResults() { return false; }
            @Override public RedisSentinelConnection getSentinelConnection() { return null; }
            @Override public DataAccessException translateExceptionIfPossible(RuntimeException ex) { return null; }
        };
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory());
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }

    @Bean
    public KmsClient kmsClient() {
        // Mockito를 사용하여 KmsClient 모킹
        return Mockito.mock(KmsClient.class);
    }

    @Bean
    public S3Presigner s3Presigner() {
        // Mockito를 사용하여 S3Presigner 모킹
        return Mockito.mock(S3Presigner.class);
    }

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("products", "categories");
    }
}
