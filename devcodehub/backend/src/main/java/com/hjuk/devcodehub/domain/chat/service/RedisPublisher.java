package com.hjuk.devcodehub.domain.chat.service;

import com.hjuk.devcodehub.domain.chat.dto.ChatMessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RedisPublisher {

  private final RedisTemplate<String, Object> redisTemplate;
  private final ChannelTopic channelTopic;

  /**
   * [Why] 채팅방으로 메시지를 발행함. 발행된 메시지는 Redis Pub/Sub을 통해 모든 서버 인스턴스의 Subscriber에게 전달됨.
   *
   * @param message    발행할 채팅 메시지 응답
   * @param instanceId 현재 서버 인스턴스 ID
   */
  public void publish(ChatMessageResponse message, String instanceId) {
    try {
      java.lang.reflect.Field field = message.getClass().getDeclaredField("senderInstanceId");
      field.setAccessible(true);
      field.set(message, instanceId);
    } catch (Exception e) {
      // 필드 주입 실패 시 무시
    }
    redisTemplate.convertAndSend(channelTopic.getTopic(), message);
  }
}
