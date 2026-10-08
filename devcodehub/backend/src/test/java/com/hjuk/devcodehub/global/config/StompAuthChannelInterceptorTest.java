package com.hjuk.devcodehub.global.config;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.hjuk.devcodehub.domain.chat.repository.ChatRoomUserRepository;
import com.hjuk.devcodehub.global.security.jwt.JwtProvider;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

class StompAuthChannelInterceptorTest {

  private JwtProvider jwtProvider;
  private ChatRoomUserRepository chatRoomUserRepository;
  private StompAuthChannelInterceptor interceptor;

  @BeforeEach
  void setUp() {
    jwtProvider = mock(JwtProvider.class);
    chatRoomUserRepository = mock(ChatRoomUserRepository.class);
    interceptor = new StompAuthChannelInterceptor(jwtProvider, chatRoomUserRepository);
  }

  private Authentication auth(String loginId, String role) {
    return new UsernamePasswordAuthenticationToken(
        loginId, null, List.of(new SimpleGrantedAuthority(role)));
  }

  private Message<byte[]> frame(StompCommand command, Authentication user, String destination, String bearer) {
    StompHeaderAccessor accessor = StompHeaderAccessor.create(command);
    if (destination != null) {
      accessor.setDestination(destination);
    }
    if (bearer != null) {
      accessor.addNativeHeader("Authorization", bearer);
    }
    accessor.setUser(user);
    accessor.setLeaveMutable(true);
    return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
  }

  @Test
  @DisplayName("토큰 없는 CONNECT는 거부된다")
  void connect_withoutToken() {
    assertThrows(
        MessagingException.class,
        () -> interceptor.preSend(frame(StompCommand.CONNECT, null, null, null), null));
  }

  @Test
  @DisplayName("유효하지 않은 토큰의 CONNECT는 거부된다")
  void connect_invalidToken() {
    when(jwtProvider.validateToken("bad")).thenReturn(false);

    assertThrows(
        MessagingException.class,
        () -> interceptor.preSend(frame(StompCommand.CONNECT, null, null, "Bearer bad"), null));
  }

  @Test
  @DisplayName("유효한 토큰의 CONNECT는 사용자 정보가 설정된다")
  void connect_validToken() {
    when(jwtProvider.validateToken("good")).thenReturn(true);
    when(jwtProvider.getAuthentication("good")).thenReturn(auth("alice", "ROLE_USER"));

    assertDoesNotThrow(
        () -> interceptor.preSend(frame(StompCommand.CONNECT, null, null, "Bearer good"), null));
  }

  @Test
  @DisplayName("참여자가 아닌 채팅방은 구독할 수 없다")
  void subscribe_roomNotMember() {
    when(chatRoomUserRepository.existsByChatRoomIdAndUserLoginId(7L, "alice")).thenReturn(false);

    assertThrows(
        MessagingException.class,
        () ->
            interceptor.preSend(
                frame(StompCommand.SUBSCRIBE, auth("alice", "ROLE_USER"), "/sub/chat/room/7", null), null));
  }

  @Test
  @DisplayName("참여한 채팅방은 구독할 수 있다")
  void subscribe_roomMember() {
    when(chatRoomUserRepository.existsByChatRoomIdAndUserLoginId(7L, "alice")).thenReturn(true);

    assertDoesNotThrow(
        () ->
            interceptor.preSend(
                frame(StompCommand.SUBSCRIBE, auth("alice", "ROLE_USER"), "/sub/chat/room/7", null), null));
  }

  @Test
  @DisplayName("남의 알림·미읽음 채널은 구독할 수 없고 본인 채널은 가능하다")
  void subscribe_privateChannels() {
    Authentication alice = auth("alice", "ROLE_USER");

    assertThrows(
        MessagingException.class,
        () -> interceptor.preSend(frame(StompCommand.SUBSCRIBE, alice, "/sub/notifications/bob", null), null));
    assertThrows(
        MessagingException.class,
        () -> interceptor.preSend(frame(StompCommand.SUBSCRIBE, alice, "/sub/chat/unread/bob", null), null));
    assertDoesNotThrow(
        () -> interceptor.preSend(frame(StompCommand.SUBSCRIBE, alice, "/sub/notifications/alice", null), null));
  }

  @Test
  @DisplayName("관리자·시니어 공용 채널은 해당 역할만 구독할 수 있다")
  void subscribe_roleChannels() {
    Authentication user = auth("alice", "ROLE_USER");
    Authentication admin = auth("root", "ROLE_ADMIN");

    assertThrows(
        MessagingException.class,
        () -> interceptor.preSend(frame(StompCommand.SUBSCRIBE, user, "/sub/notifications/admin", null), null));
    assertDoesNotThrow(
        () -> interceptor.preSend(frame(StompCommand.SUBSCRIBE, admin, "/sub/notifications/admin", null), null));
  }

  @Test
  @DisplayName("미인증 SUBSCRIBE·허용되지 않은 SEND 경로는 거부된다")
  void unauthenticatedOrBadDestination() {
    assertThrows(
        MessagingException.class,
        () -> interceptor.preSend(frame(StompCommand.SUBSCRIBE, null, "/sub/chat/room/7", null), null));
    assertThrows(
        MessagingException.class,
        () ->
            interceptor.preSend(
                frame(StompCommand.SEND, auth("alice", "ROLE_USER"), "/pub/anything-else", null), null));
  }
}
