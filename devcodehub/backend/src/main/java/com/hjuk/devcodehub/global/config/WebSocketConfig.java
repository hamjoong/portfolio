package com.hjuk.devcodehub.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  @Value("${FRONTEND_URL:http://localhost:5173}")
  private String allowedOrigin;

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    // 메시지를 구독하는 요청의 접두사
    config.enableSimpleBroker("/sub");
    // 메시지를 발행하는 요청의 접두사
    config.setApplicationDestinationPrefixes("/pub");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    // stomp 엔드포인트 설정
    registry.addEndpoint("/api/v1/ws-stomp")
            .setAllowedOriginPatterns(allowedOrigin)
            .withSockJS();
  }
}
