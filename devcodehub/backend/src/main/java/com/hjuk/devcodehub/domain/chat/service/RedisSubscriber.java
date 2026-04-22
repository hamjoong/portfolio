package com.hjuk.devcodehub.domain.chat.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hjuk.devcodehub.domain.chat.dto.ChatMessageResponse;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisSubscriber {

  private final ObjectMapper objectMapper;
  private final SimpMessageSendingOperations messagingTemplate;
  private final ChatService chatService;

  @PostConstruct
  public void init() {
    objectMapper.registerModule(new JavaTimeModule());
  }

  /**
   * [Why] Redis에서 발행된 메시지를 수신하여 STOMP 구독자들에게 전송함. 본인 인스턴스에서 온 메시지는 무시하여 중복 방지.
   *
   * @param publishMessage 수신된 JSON 형태의 메시지 문자열
   */
  public void sendMessage(String publishMessage) {
    try {
      ChatMessageResponse chatMessage =
          objectMapper.readValue(publishMessage, ChatMessageResponse.class);

      if (chatService.getInstanceId().equals(chatMessage.getSenderInstanceId())) {
        return;
      }

      log.info(
          "Received message from Redis for room: {}, sender: {}",
          chatMessage.getRoomId(),
          chatMessage.getSenderLoginId());

      messagingTemplate.convertAndSend("/sub/chat/room/" + chatMessage.getRoomId(), chatMessage);
    } catch (Exception e) {
      log.error("Exception in RedisSubscriber: {}", e.getMessage(), e);
    }
  }
}
