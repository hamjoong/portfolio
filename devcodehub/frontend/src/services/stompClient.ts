import { Client, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useChatStore } from '../store/chatStore';
import { API_SERVER_URL } from './constants';

class StompClient {
  private client: Client | null = null;
  private subscriptions: Record<string, StompSubscription> = {};
  private pendingSubscriptions: Record<string, (message: Record<string, unknown> | string) => void> = {};

  connect(accessToken: string) {
    if (this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${API_SERVER_URL}/ws-stomp`),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (import.meta.env.DEV) console.log(str);
      },
    });

    this.client.onConnect = () => {
      useChatStore.getState().setConnected(true);
      Object.entries(this.pendingSubscriptions).forEach(([dest, callback]) => {
        this.subscribe(dest, callback);
      });
      this.pendingSubscriptions = {};
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers['message']);
    };

    this.client.onDisconnect = () => {
      useChatStore.getState().setConnected(false);
    };

    this.client.activate();
  }

  async disconnect() {
    if (this.client) {
      const tempClient = this.client;
      this.client = null;
      this.subscriptions = {};
      this.pendingSubscriptions = {};
      
      try {
        await tempClient.deactivate();
        useChatStore.getState().setConnected(false);
      } catch (e) {
        // 종료 시 에러 무시
      }
    }
  }

  subscribe(destination: string, callback: (message: Record<string, unknown> | string) => void) {
    if (!this.client?.connected) {
      this.pendingSubscriptions[destination] = callback;
      return;
    }

    if (this.subscriptions[destination]) return;

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const body = JSON.parse(message.body);
        callback(body);
      } catch {
        callback(message.body);
      }
    });

    this.subscriptions[destination] = subscription;
  }

  unsubscribe(destination: string) {
    if (this.subscriptions[destination]) {
      this.subscriptions[destination].unsubscribe();
      delete this.subscriptions[destination];
    }
    if (this.pendingSubscriptions[destination]) {
      delete this.pendingSubscriptions[destination];
    }
  }

  publish(destination: string, body: Record<string, unknown>) {
    if (!this.client?.connected) {
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }
}

export const stompClient = new StompClient();
