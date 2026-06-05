import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { useOS } from '@/hooks/useOSStore';
import { safeJsonParse } from '@/utils/safeJsonParse';
import { BACKEND_WS } from '@/utils/backendUrl';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

interface RealTerminalProps {
  windowId?: string;
}

const SessionIdSchema = z.string().uuid();

function getOrCreateSessionId(): string {
  const raw = localStorage.getItem('real-terminal-session-id');
  const parsed = safeJsonParse(raw ?? 'null', SessionIdSchema, null);
  if (parsed) return parsed;
  const newId = uuidv4();
  localStorage.setItem('real-terminal-session-id', JSON.stringify(newId));
  return newId;
}

export default function RealTerminal({ windowId }: RealTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { state } = useOS();

  const reconnectDelay = useRef(1000);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const heartbeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback(() => {
    const sessionId = getOrCreateSessionId();
    const token = state.auth.authToken ?? '';
    const ws = new WebSocket(`${BACKEND_WS}/ws?token=${token}&sessionId=${sessionId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectDelay.current = 1000; // Reset backoff on successful connection
      // Start heartbeat to keep session alive
      heartbeatInterval.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as { type: string; data?: string };
        if (msg.type === 'output' && msg.data) {
          terminal.current?.write(msg.data);
        }
      } catch {
        // Ignore invalid messages
      }
    };

    ws.onclose = () => {
      // Clear heartbeat on disconnect
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
      // Exponential backoff capped at 30 s
      if (reconnectTimer.current) return;
      reconnectTimer.current = setTimeout(() => {
        reconnectTimer.current = null;
        connect();
      }, reconnectDelay.current);
      reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [state.auth.authToken]);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: 'monospace',
      fontSize: 14,
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
      },
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.loadAddon(new WebLinksAddon());

    terminal.current = term;
    fitAddon.current = fit;

    term.open(terminalRef.current);
    fit.fit();

    term.onData((data) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'input', data }));
      }
    });

    connect();

    const resizeObserver = new ResizeObserver(() => {
      fit.fit();
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const dims = { cols: term.cols, rows: term.rows };
        wsRef.current.send(JSON.stringify({ type: 'resize', ...dims }));
      }
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      // Clear heartbeat on unmount
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'close' }));
        wsRef.current.close();
      }
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      term.dispose();
    };
  }, [connect]);

  // Focus terminal when window is focused
  useEffect(() => {
    const win = state.windows.find((w) => w.id === windowId);
    if (win?.isFocused) {
      terminal.current?.focus();
    }
  }, [state.windows, windowId]);

  return (
    <div
      ref={terminalRef}
      style={{
        width: '100%',
        height: '100%',
        background: '#1e1e1e',
      }}
    />
  );
}