import { Client, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useChatStore } from '../store/chatStore';
import { API_BASE_URL } from './constants';

type MessageHandler = (message: Record<string, unknown> | string) => void;

/**
 * 앱 전체에서 하나만 쓰는 STOMP 클라이언트.
 * - 연결은 App이 로그인 상태에 맞춰 관리하고, 각 화면은 구독만 등록/해제한다.
 * - 구독 목록(handlers)을 따로 기억해 두었다가, 연결이 끊겼다 다시 붙을 때마다 자동으로 복구한다.
 */
class StompClient {
  private client: Client | null = null;
  private token: string | null = null;
  private handlers = new Map<string, MessageHandler>();
  private active = new Map<string, StompSubscription>();

  connect(accessToken: string) {
    // [Why] 같은 토큰으로 이미 연결 중/연결됨이면 소켓을 또 만들지 않는다. 토큰이 바뀌면 새로 연결한다.
    if (this.client && this.token === accessToken) return;
    if (this.client) this.disconnect();

    this.token = accessToken;
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL.replace(/\/$/, '')}/ws-stomp`),
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      useChatStore.getState().setConnected(true);
      // 재연결 후에는 서버 쪽 구독이 사라지므로 등록해 둔 구독을 모두 다시 건다
      this.active.clear();
      this.handlers.forEach((handler, destination) => this.attach(destination, handler));
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers['message']);
    };

    this.client.onWebSocketClose = () => {
      useChatStore.getState().setConnected(false);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate().catch((e) => console.error('STOMP disconnection error:', e));
    }
    this.client = null;
    this.token = null;
    this.handlers.clear();
    this.active.clear();
    useChatStore.getState().setConnected(false);
  }

  subscribe(destination: string, handler: MessageHandler) {
    this.handlers.set(destination, handler);
    if (this.client?.connected) {
      this.active.get(destination)?.unsubscribe();
      this.attach(destination, handler);
    }
  }

  unsubscribe(destination: string) {
    this.handlers.delete(destination);
    this.active.get(destination)?.unsubscribe();
    this.active.delete(destination);
  }

  publish(destination: string, body: Record<string, unknown>) {
    if (!this.client?.connected) {
      console.error('STOMP client not connected. Cannot publish.');
      return;
    }
    this.client.publish({ destination, body: JSON.stringify(body) });
  }

  private attach(destination: string, handler: MessageHandler) {
    if (!this.client?.connected) return;
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        handler(JSON.parse(message.body));
      } catch {
        handler(message.body); // JSON이 아닌 일반 텍스트일 경우
      }
    });
    this.active.set(destination, subscription);
  }
}

export const stompClient = new StompClient();
