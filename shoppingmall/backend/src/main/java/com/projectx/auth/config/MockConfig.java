package com.projectx.auth.config;

import org.mockito.Mockito;
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
 * [성능 최적화] 테스트 환경에서도 메모리 기반 캐싱이 동작하도록 설정하여 
 * 실제 어플리케이션과 유사한 성능 특징을 갖도록 개선했습니다.
 */
@Configuration
@Profile({"test", "mock"})
public class MockConfig {

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return Mockito.mock(RedisConnectionFactory.class);
    }

    /**
     * 가짜 RedisTemplate을 생성합니다.
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory());
        template.setKeySerializer(new StringRedisSerializer());
        return template;
    }

    @Bean
    public KmsClient kmsClient() {
        return Mockito.mock(KmsClient.class);
    }

    @Bean
    public S3Presigner s3Presigner() {
        return Mockito.mock(S3Presigner.class);
    }

    @Bean
    public CacheManager cacheManager() {
        // [성능 최적화] 테스트 환경에서도 실제 캐싱 로직이 동작하도록 메모리 기반 캐시 매니저를 반환합니다.
        return new ConcurrentMapCacheManager("products", "categories");
    }
}
