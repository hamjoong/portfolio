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
@Profile({"dev"}) // [Phase 7] 운영 환경(prod)에서는 Redis 설정을 완전히 배제하여 안정성 확보
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
            // [수정] Mockito 대신 직접 익명 클래스로 가짜 ConnectionFactory를 구현합니다.
            // 런타임(JRE) 환경에서 Mockito 플러그인 초기화 에러를 방지하기 위함입니다.
            connectionFactory = new RedisConnectionFactory() {
                @Override public org.springframework.data.redis.connection.RedisConnection getConnection() { return null; }
                @Override public org.springframework.data.redis.connection.RedisClusterConnection getClusterConnection() { return null; }
                @Override public boolean getConvertPipelineAndTxResults() { return false; }
                @Override public org.springframework.data.redis.connection.RedisSentinelConnection getSentinelConnection() { return null; }
                @Override public org.springframework.dao.DataAccessException translateExceptionIfPossible(RuntimeException ex) { return null; }
            };
        }
        
        template.setConnectionFactory(connectionFactory);
        
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        
        return template;
    }

    /**
     * 캐시 매니저를 설정합니다.
     * [성능 최적화] Redis가 없는 환경에서도 어플리케이션이 구동될 수 있도록 
     * 로컬 메모리 기반의 CacheManager를 기본값으로 제공합니다.
     */
    @Bean
    public org.springframework.cache.CacheManager cacheManager() {
        return new org.springframework.cache.concurrent.ConcurrentMapCacheManager("products", "categories");
    }
}
