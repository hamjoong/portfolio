package com.hjuk.devcodehub.domain.chat.controller;

import com.hjuk.devcodehub.domain.chat.dto.ChatMessageRequest;
import com.hjuk.devcodehub.domain.chat.dto.ChatMessageResponse;
import com.hjuk.devcodehub.domain.chat.service.ChatService;
import com.hjuk.devcodehub.domain.chat.service.RedisPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatMessageController {

  private final RedisPublisher redisPublisher;
  private final ChatService chatService;
  private final org.springframework.messaging.simp.SimpMessageSendingOperations messagingTemplate;

  @org.springframework.beans.factory.annotation.Value("${app.redis.auto-startup:true}")
  private boolean isRedisEnabled;

  /**
   * [Why] WebSocket으로 들어온 메시지를 처리함. DB에 저장하고 즉시 브로드캐스팅하여 반응성을 높임.
   *
   * @param request 채팅 메시지 요청 데이터
   */
  @MessageMapping("/chat/message")
  public void message(ChatMessageRequest request, java.security.Principal principal) {
    // 1. 메시지 저장 및 상세 정보 구성 (발신자는 STOMP 인증 정보에서 가져온다. 인터셉터가 미인증을 이미 차단함)
    if (principal == null) {
      return;
    }
    ChatMessageResponse response = chatService.saveMessage(request, principal.getName());

    // 2. 해당 채팅방 구독자들에게 즉시 메시지 전송 (Local Instance)
    messagingTemplate.convertAndSend("/sub/chat/room/" + response.getRoomId(), response);

    // 3. Redis가 활성화된 경우에만 다른 서버 인스턴스로 전파
    if (isRedisEnabled) {
      redisPublisher.publish(response, chatService.getInstanceId());
    }
  }
}
