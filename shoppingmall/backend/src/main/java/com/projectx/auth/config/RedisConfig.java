package com.projectx.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis 활용을 위한 구성 클래스입니다.
 * [이유] CartService에서 사용할 RedisTemplate의 직렬화 방식을 정의하여
 * 데이터를 JSON 형태로 안전하게 저장하고 읽어오기 위함입니다.
 */
@Configuration
@Profile({"dev", "prod"})
public class RedisConfig {

    /**
     * Redis 활용을 위한 구성 클래스입니다.
     * [성능 최적화] Redis 연결이 불가능한 환경(예: Render 무료 티어)에서도 
     * 어플리케이션이 기동될 수 있도록 가짜(Mock) 빈 생성을 지원합니다.
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(org.springframework.beans.factory.ObjectProvider<RedisConnectionFactory> connectionFactoryProvider) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        
        RedisConnectionFactory connectionFactory = connectionFactoryProvider.getIfAvailable();
        if (connectionFactory == null) {
            // Redis가 없는 환경에서는 Mockito를 사용해 가짜 연결 팩토리를 주입합니다.
            connectionFactory = org.mockito.Mockito.mock(RedisConnectionFactory.class);
        }
        
        template.setConnectionFactory(connectionFactory);
        
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        
        return template;
    }
}
