package com.projectx.auth.config;

import org.mockito.Mockito;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import software.amazon.awssdk.services.kms.KmsClient;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

/**
 * 테스트 환경에서 외부 시스템 연동을 모의(Mock) 처리하는 설정 클래스입니다.
 * [이유] 실제 AWS나 Redis 서버가 실행 중이지 않아도 백엔드 비즈니스 로직을
 * 안전하게 테스트하고 서버를 기동하기 위함입니다.
 */
@Profile("test")
@Configuration
public class TestConfig {

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return Mockito.mock(RedisConnectionFactory.class);
    }

    @Bean(name = "redisTemplate")
    public RedisTemplate<String, Object> redisTemplate() {
        return Mockito.mock(RedisTemplate.class);
    }

    @Bean
    public KmsClient kmsClient() {
        return Mockito.mock(KmsClient.class);
    }

    @Bean
    public S3Presigner s3Presigner() {
        return Mockito.mock(S3Presigner.class);
    }
}
