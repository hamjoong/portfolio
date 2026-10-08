package com.hjuk.devcodehub.global.config;

import com.hjuk.devcodehub.domain.chat.repository.ChatRoomUserRepository;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import com.hjuk.devcodehub.global.security.jwt.JwtProvider;

/**
 * [Why] HTTP 보안 필터는 STOMP 프레임에 적용되지 않는다. 인증 없이 소켓을 열고 남의 채팅방·알림 채널을 구독하거나 다른 사람 이름으로
 * 메시지를 보낼 수 없도록 CONNECT·SUBSCRIBE·SEND 단계에서 직접 검사한다.
 */
@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

  private static final String BEARER_PREFIX = "Bearer ";
  private static final Pattern CHAT_ROOM = Pattern.compile("^/sub/chat/room/(\\d+)$");
  private static final Pattern PRIVATE_CHANNEL =
      Pattern.compile("^/sub/(?:chat/unread|notifications)/([^/]+)$");
  private static final String SEND_DESTINATION = "/pub/chat/message";

  private final JwtProvider jwtProvider;
  private final ChatRoomUserRepository chatRoomUserRepository;

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {
    StompHeaderAccessor accessor =
        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
    if (accessor == null || accessor.getCommand() == null) {
      return message;
    }

    StompCommand command = accessor.getCommand();
    if (StompCommand.CONNECT.equals(command)) {
      accessor.setUser(authenticate(accessor.getFirstNativeHeader("Authorization")));
    } else if (StompCommand.SUBSCRIBE.equals(command)) {
      authorizeSubscribe(requireUser(accessor), accessor.getDestination());
    } else if (StompCommand.SEND.equals(command)) {
      requireUser(accessor);
      if (!SEND_DESTINATION.equals(accessor.getDestination())) {
        throw new MessagingException("허용되지 않은 전송 경로입니다.");
      }
    }
    return message;
  }

  private Authentication authenticate(String authorization) {
    if (authorization == null || !authorization.startsWith(BEARER_PREFIX)) {
      throw new MessagingException("인증이 필요합니다.");
    }
    String token = authorization.substring(BEARER_PREFIX.length());
    if (!jwtProvider.validateToken(token)) {
      throw new MessagingException("유효하지 않은 토큰입니다.");
    }
    return jwtProvider.getAuthentication(token);
  }

  private Authentication requireUser(StompHeaderAccessor accessor) {
    if (!(accessor.getUser() instanceof Authentication auth)) {
      throw new MessagingException("인증이 필요합니다.");
    }
    return auth;
  }

  private void authorizeSubscribe(Authentication auth, String destination) {
    if (destination == null) {
      throw new MessagingException("구독 경로가 없습니다.");
    }
    String loginId = auth.getName();

    Matcher room = CHAT_ROOM.matcher(destination);
    if (room.matches()) {
      boolean member =
          chatRoomUserRepository.existsByChatRoomIdAndUserLoginId(
              Long.parseLong(room.group(1)), loginId);
      if (!member) {
        throw new MessagingException("채팅방 참여자만 구독할 수 있습니다.");
      }
      return;
    }

    Matcher priv = PRIVATE_CHANNEL.matcher(destination);
    if (priv.matches()) {
      String target = priv.group(1);
      // [Why] 'admin'·'senior'는 역할 공용 채널, 그 외에는 본인 loginId 채널만 허용
      boolean allowed =
          target.equals(loginId)
              || ("admin".equals(target) && hasRole(auth, "ROLE_ADMIN"))
              || ("senior".equals(target)
                  && (hasRole(auth, "ROLE_SENIOR") || hasRole(auth, "ROLE_ADMIN")));
      if (!allowed) {
        throw new MessagingException("본인 채널만 구독할 수 있습니다.");
      }
      return;
    }

    throw new MessagingException("허용되지 않은 구독 경로입니다.");
  }

  private boolean hasRole(Authentication auth, String role) {
    for (GrantedAuthority a : auth.getAuthorities()) {
      if (role.equals(a.getAuthority())) {
        return true;
      }
    }
    return false;
  }
}
