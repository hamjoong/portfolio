package com.hjuk.devcodehub.domain.chat.scheduler;

import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

import com.hjuk.devcodehub.domain.chat.domain.ChatRoom;
import com.hjuk.devcodehub.domain.chat.dto.ChatMessageRequest;
import com.hjuk.devcodehub.domain.chat.repository.ChatMessageRepository;
import com.hjuk.devcodehub.domain.chat.repository.ChatRoomRepository;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.RedisTemplate;

@ExtendWith(MockitoExtension.class)
class ChatWriteBehindSchedulerTest {

  @Mock private RedisTemplate<String, Object> redisTemplate;
  @Mock private ChatMessageRepository chatMessageRepository;
  @Mock private ChatRoomRepository chatRoomRepository;
  @Mock private UserRepository userRepository;
  @Mock private ListOperations<String, Object> listOperations;

  @InjectMocks private ChatWriteBehindScheduler scheduler;

  @Test
  @DisplayName("Redis의 채팅 메시지를 벌크로 DB에 저장해야 함")
  void flushChatMessages_BulkTest() {
    // given
    when(redisTemplate.opsForList()).thenReturn(listOperations);
    when(listOperations.size(anyString())).thenReturn(1L);

    ChatMessageRequest request = new ChatMessageRequest();
    request.setRoomId(1L);
    request.setSenderLoginId("user1");
    request.setMessage("Hello");

    when(listOperations.range(anyString(), eq(0L), eq(0L))).thenReturn(List.of(request));

    ChatRoom room = mock(ChatRoom.class);
    when(room.getId()).thenReturn(1L);
    User user = mock(User.class);
    when(user.getLoginId()).thenReturn("user1");

    when(chatRoomRepository.findAllById(anySet())).thenReturn(List.of(room));
    when(userRepository.findByLoginIdIn(anySet())).thenReturn(List.of(user));

    // when
    scheduler.flushChatMessages();

    // then
    verify(listOperations).trim(anyString(), eq(1L), eq(-1L));
    verify(chatMessageRepository, times(1)).saveAll(anyList());
  }
}
