import { Client, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useChatStore } from '../store/chatStore';
import { API_SERVER_URL } from './constants';

class StompClient {
  private client: Client | null = null;
  private subscriptions: Record<string, StompSubscription> = {};
  private pendingSubscriptions: (() => void)[] = [];

  connect(accessToken: string) {
    if (this.client?.connected) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${API_SERVER_URL}/ws-stomp`),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      useChatStore.getState().setConnected(true);
      // 연결 후 대기 중이던 구독을 실행
      this.pendingSubscriptions.forEach(sub => sub());
      this.pendingSubscriptions = [];
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers['message']);
    };

    this.client.onDisconnect = () => {
      useChatStore.getState().setConnected(false);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {
        console.error('STOMP disconnection error:', e);
      }
      this.client = null;
      this.subscriptions = {};
      this.pendingSubscriptions = [];
    }
  }

  subscribe(destination: string, callback: (message: Record<string, unknown> | string) => void) {
    if (!this.client?.connected) {
      this.pendingSubscriptions.push(() => this.subscribe(destination, callback));
      return;
    }

    if (this.subscriptions[destination]) return;

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const body = JSON.parse(message.body);
        callback(body);
      } catch {
        callback(message.body); // JSON이 아닌 일반 텍스트일 경우
      }
    });

    this.subscriptions[destination] = subscription;
  }

  unsubscribe(destination: string) {
    if (this.subscriptions[destination]) {
      this.subscriptions[destination].unsubscribe();
      delete this.subscriptions[destination];
    }
  }

  publish(destination: string, body: Record<string, unknown>) {
    if (!this.client?.connected) {
      console.error('STOMP client not connected. Cannot publish.');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }
}

export const stompClient = new StompClient();
