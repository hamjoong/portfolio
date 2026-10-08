package com.hjuk.devcodehub.global.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hjuk.devcodehub.domain.chat.service.RedisSubscriber;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

  /**
   * [Why] Redis Pub/Sub을 위한 토픽 설정. 모든 채팅 메시지는 이 토픽을 통해 전파됨.
   *
   * @return ChannelTopic 객체
   */
  @Bean
  public ChannelTopic channelTopic() {
    return new ChannelTopic("chatroom");
  }

  /**
   * [Why] Redis 메시지를 리스닝하여 구독자에게 전달하는 컨테이너 설정. 기본값은 true이며, 개발 환경에서 Redis 없이 시작하려면
   * app.redis.auto-startup=false로 설정 가능.
   *
   * @param connectionFactory Redis 연결 팩토리
   * @param listenerAdapter   메시지 리스너 어댑터
   * @param channelTopic      채널 토픽
   * @return Redis 메시지 리스너 컨테이너
   */
  @Bean
  @org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
      name = "app.redis.auto-startup",
      havingValue = "true",
      matchIfMissing = true)
  public RedisMessageListenerContainer redisMessageListener(
      RedisConnectionFactory connectionFactory,
      MessageListenerAdapter listenerAdapter,
      ChannelTopic channelTopic) {
    RedisMessageListenerContainer container = new RedisMessageListenerContainer();
    container.setConnectionFactory(connectionFactory);
    container.addMessageListener(listenerAdapter, channelTopic);

    // [Why] Redis 연결 실패 시 앱 기동 중단을 방지하기 위해 에러 핸들러 설정
    container.setErrorHandler(e -> {
      System.err.println("Redis Listener Error: " + e.getMessage());
    });

    return container;
  }

  /**
   * [Why] 실제 메시지를 처리할 구독자(Subscriber) 설정. RedisSubscriber가 String을 받아서 직접 파싱하므로
   * StringRedisSerializer를 사용함.
   *
   * @param subscriber 메시지 구독자 서비스
   * @return 메시지 리스너 어댑터
   */
  @Bean
  public MessageListenerAdapter listenerAdapter(RedisSubscriber subscriber) {
    MessageListenerAdapter adapter = new MessageListenerAdapter(subscriber, "sendMessage");
    adapter.setSerializer(new StringRedisSerializer());
    return adapter;
  }

  /**
   * [Why] Redis와의 데이터 통신을 위한 템플릿 설정. JSON 직렬화를 사용하여 객체 데이터를 저장함. LocalDateTime 등 Java 8 날짜 타입을
   * 지원하도록 ObjectMapper를 커스텀 설정함.
   *
   * @param connectionFactory Redis 연결 팩토리
   * @return 설정된 RedisTemplate 객체
   */
  @Bean
  public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule());
    objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    Jackson2JsonRedisSerializer<Object> serializer =
        new Jackson2JsonRedisSerializer<>(objectMapper, Object.class);

    RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
    redisTemplate.setConnectionFactory(connectionFactory);
    redisTemplate.setKeySerializer(new StringRedisSerializer());
    redisTemplate.setValueSerializer(serializer);
    redisTemplate.setHashKeySerializer(new StringRedisSerializer());
    redisTemplate.setHashValueSerializer(serializer);
    return redisTemplate;
  }
}
