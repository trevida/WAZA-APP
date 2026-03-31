import { useEffect, useRef, useCallback, useState } from 'react';
import useAuthStore from '@/store/authStore';

const WS_BASE = process.env.REACT_APP_BACKEND_URL?.replace('https://', 'wss://').replace('http://', 'ws://');

export function useConversationWS(conversationId) {
  const wsRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const token = useAuthStore((state) => state.token);
  const reconnectRef = useRef(null);

  const connect = useCallback(() => {
    if (!conversationId || !token || !WS_BASE) return;

    const url = `${WS_BASE}/api/ws/conversations/${conversationId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ token }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'connected':
          setConnected(true);
          break;
        case 'new_message':
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
          break;
        case 'typing':
          setIsTyping(data.is_typing);
          break;
        case 'error':
          console.error('WS error:', data.message);
          break;
        default:
          break;
      }
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectRef.current = setTimeout(() => connect(), 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [conversationId, token]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { messages, isTyping, connected };
}

export function useNotificationWS() {
  const wsRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const reconnectRef = useRef(null);

  const connect = useCallback(() => {
    if (!user?.id || !token || !WS_BASE) return;

    const url = `${WS_BASE}/api/ws/notifications/${user.id}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ token }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message_notification') {
        setNotifications((prev) => [data, ...prev].slice(0, 20));
        setUnreadCount((prev) => prev + 1);
      }
    };

    ws.onclose = () => {
      reconnectRef.current = setTimeout(() => connect(), 5000);
    };

    ws.onerror = () => ws.close();
  }, [user?.id, token]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  return { notifications, unreadCount, clearUnread };
}
