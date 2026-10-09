import { useCallback, useEffect, useRef, useState } from "react";
import type { AxiosError } from "axios";
import apiClient from "../../../other/services/apiClient";
import type { ServerEvent } from "./types";

export type SocketStatus = "idle" | "connecting" | "connected" | "reconnecting" | "closed";

const WS_BASE = (
  import.meta.env.VITE_WS_BASE_URL ||
  `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.hostname}:8001`
).replace(/\/$/, "");

const HEARTBEAT_MS = 25_000; // app-level ping (keeps proxies from closing idle sockets)
const PONG_TIMEOUT_MS = 10_000; // no reply -> socket is half-open -> force a reconnect
const MAX_BACKOFF_MS = 30_000;
// Server close codes meaning "retrying will not help" (see CloseCode in consumers.py)
const FATAL_CLOSE_CODES = new Set([4400, 4401, 4403, 4404]);

interface OpenInfo {
  isReconnect: boolean;
  send: (payload: object) => boolean;
}

interface Options {
  /** e.g. "/ws/chat/general/". null = stay disconnected. THE ONLY THING THAT RECONNECTS THE SOCKET. */
  roomPath: string | null;
  onEvent: (event: ServerEvent) => void;
  onOpen?: (info: OpenInfo) => void;
}

export function useChatSocket({ roomPath, onEvent, onOpen }: Options) {
  const [status, setStatus] = useState<SocketStatus>("idle");
  const [nonce, setNonce] = useState(0); // bump to force a manual reconnect

  const socketRef = useRef<WebSocket | null>(null);

  // Keep the latest callbacks in refs: changing them never re-creates the socket.
  const onEventRef = useRef(onEvent);
  const onOpenRef = useRef(onOpen);
  onEventRef.current = onEvent;
  onOpenRef.current = onOpen;

  const send = useCallback((payload: object): boolean => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }, []);

  const reconnect = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!roomPath) {
      setStatus("idle");
      return;
    }

    let cancelled = false;
    let fatal = false;
    let connecting = false;
    let attempt = 0;
    let hasConnectedBefore = false;
    let socket: WebSocket | null = null;
    let retryTimer: number | undefined;
    let heartbeatTimer: number | undefined;
    let pongTimer: number | undefined;

    const clearSocketTimers = () => {
      window.clearInterval(heartbeatTimer);
      window.clearTimeout(pongTimer);
    };

    const sendPing = () => {
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      const ws = socket;
      ws.send('{"type":"ping"}');
      window.clearTimeout(pongTimer);
      pongTimer = window.setTimeout(() => ws.close(), PONG_TIMEOUT_MS);
    };

    const scheduleRetry = () => {
      if (cancelled || fatal) return;
      setStatus("reconnecting");
      const delay = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** attempt) * (0.5 + Math.random() / 2);
      attempt += 1;
      retryTimer = window.setTimeout(connect, delay);
    };

    const connect = async () => {
      if (cancelled || connecting) return;
      connecting = true;
      setStatus(hasConnectedBefore ? "reconnecting" : "connecting");

      // A fresh one-time ticket for EVERY attempt: no stale/expired JWT in the URL.
      let ticket: string;
      try {
        const { data } = await apiClient.post<{ ticket: string }>("/chat/ws-ticket/");
        ticket = data.ticket;
      } catch (error) {
        connecting = false;
        if (cancelled) return;
        const httpStatus = (error as AxiosError).response?.status;
        if (httpStatus === 401 || httpStatus === 403) {
          fatal = true;
          setStatus("closed");
          return;
        }
        scheduleRetry();
        return;
      }
      connecting = false;
      if (cancelled) return;

      const ws = new WebSocket(`${WS_BASE}${roomPath}?ticket=${encodeURIComponent(ticket)}`);
      socket = ws;
      socketRef.current = ws;

      ws.onopen = () => {
        if (cancelled || socket !== ws) return;
        const isReconnect = hasConnectedBefore;
        hasConnectedBefore = true;
        attempt = 0;
        setStatus("connected");
        heartbeatTimer = window.setInterval(sendPing, HEARTBEAT_MS);
        onOpenRef.current?.({ isReconnect, send });
      };

      ws.onmessage = (event) => {
        if (cancelled || socket !== ws) return; // late event from a previous room/socket
        window.clearTimeout(pongTimer);
        try {
          const parsed = JSON.parse(event.data) as ServerEvent;
          if (parsed.type !== "pong") onEventRef.current(parsed);
        } catch {
          /* ignore malformed frames */
        }
      };

      ws.onerror = () => {
        /* always followed by onclose, which handles retrying */
      };

      ws.onclose = (event) => {
        clearSocketTimers();
        if (cancelled || socket !== ws) return;
        socketRef.current = null;
        if (FATAL_CLOSE_CODES.has(event.code)) {
          fatal = true;
          setStatus("closed");
          return;
        }
        scheduleRetry();
      };
    };

    // Laptop sleep / phone lock / network switch kill sockets silently.
    const wake = () => {
      if (cancelled || fatal || document.visibilityState === "hidden") return;
      if (socket && socket.readyState === WebSocket.OPEN) {
        sendPing(); // verify the connection is really alive
        return;
      }
      if (connecting || (socket && socket.readyState === WebSocket.CONNECTING)) return;
      window.clearTimeout(retryTimer);
      attempt = 0;
      connect();
    };
    window.addEventListener("online", wake);
    document.addEventListener("visibilitychange", wake);

    connect();

    return () => {
      cancelled = true;
      window.removeEventListener("online", wake);
      document.removeEventListener("visibilitychange", wake);
      window.clearTimeout(retryTimer);
      clearSocketTimers();
      socketRef.current = null;
      socket?.close(1000, "room changed or unmounted");
    };
  }, [roomPath, nonce]);

  return { status, send, reconnect };
}
