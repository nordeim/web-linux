import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { URL } from 'url';
import type { SessionStore } from './sessionStore.js';
import type { ContainerSession } from './docker.js';
import { spawnContainerShell, stopAndRemoveContainer } from './docker.js';
import { CommandPolicyEngine } from './policy.js';
import { AuditLogger } from './logger.js';
import type { ClientMessage, ServerMessage } from './types.js';

export interface WebSocketOptions {
  store: SessionStore;
  verifyToken: (token: string) => Promise<boolean>;
}

export class WebSocketHandler {
  private wss: WebSocketServer;
  private store: SessionStore;
  private verifyToken: (token: string) => Promise<boolean>;
  private sessions = new Map<string, ContainerSession>();
  private policy = new CommandPolicyEngine();
  private auditLogger = new AuditLogger();

  constructor(options: WebSocketOptions) {
    this.wss = new WebSocketServer({ noServer: true });
    this.store = options.store;
    this.verifyToken = options.verifyToken;
    this.setupEvents();
  }

  get server(): WebSocketServer {
    return this.wss;
  }

  private setupEvents(): void {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const url = new URL(req.url ?? '/', 'http://localhost');
      const token = url.searchParams.get('token');
      const sessionId = url.searchParams.get('sessionId');

      if (!token || !sessionId) {
        ws.close(1008, 'Missing token or sessionId');
        return;
      }

      this.verifyToken(token)
        .then((isValid) => {
          if (!isValid) {
            ws.close(1008, 'Invalid token');
            return;
          }
          this.startSession(ws, sessionId);
        })
        .catch(() => {
          ws.close(1008, 'Auth error');
        });
    });
  }

  private async startSession(ws: WebSocket, sessionId: string): Promise<void> {
    // Reconnection: check if a session already exists for this id
    const existing = this.sessions.get(sessionId);
    if (existing) {
      this.wireWebSocket(ws, sessionId, existing);
      this.send(ws, { type: 'init', sessionId });
      return;
    }

    try {
      const containerSession = await spawnContainerShell(sessionId, (data: string) => {
        this.send(ws, { type: 'output', data });
      });

      this.sessions.set(sessionId, containerSession);
      this.store.create(sessionId, containerSession.containerId, containerSession.pty.pid, 'user');

      this.wireWebSocket(ws, sessionId, containerSession);

      this.send(ws, { type: 'init', sessionId });
    } catch (err) {
      this.send(ws, { type: 'error', message: String(err) });
      ws.close();
    }
  }

  private wireWebSocket(ws: WebSocket, sessionId: string, containerSession: ContainerSession): void {
    ws.on('message', (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString()) as ClientMessage;
        this.handleMessage(ws, sessionId, msg, containerSession);
      } catch {
        this.send(ws, { type: 'error', message: 'Invalid JSON' });
      }
    });

    ws.on('close', () => {
      this.store.disconnect(sessionId);
      void this.endSession(sessionId);
    });
  }

  private handleMessage(
    ws: WebSocket,
    sessionId: string,
    msg: ClientMessage,
    containerSession: ContainerSession
  ): void {
    switch (msg.type) {
      case 'input': {
        const data = msg.data as string;
        // Evaluate command against security policy
        const evaluation = this.policy.evaluate(sessionId, data);
        if (!evaluation.allowed) {
          this.auditLogger.logBlocked(sessionId, data, evaluation.reason!);
          this.send(ws, { type: 'error', message: `Blocked: ${evaluation.reason}` });
          return;
        }
        // Log valid command
        this.auditLogger.logCommand({
          timestamp: new Date().toISOString(),
          sessionId,
          command: data,
          action: 'input',
        });
        // Harden: guard against a PTY that has already exited.
        try {
          containerSession.pty.write(data);
        } catch {
          this.send(ws, { type: 'error', message: 'PTY write failed' });
        }
        break;
      }
      case 'resize': {
        const cols = Number(msg.cols);
        const rows = Number(msg.rows);
        if (!Number.isNaN(cols) && !Number.isNaN(rows)) {
          containerSession.pty.resize(cols, rows);
        }
        break;
      }
      case 'close': {
        void this.endSession(sessionId);  // Explicit: fire-and-forget is intentional
        ws.close();
        break;
      }
      case 'heartbeat': {
        this.store.heartbeat(sessionId);
        this.send(ws, { type: 'heartbeat' });
        break;
      }
      default: {
        this.send(ws, { type: 'error', message: `Unknown type: ${msg.type}` });
      }
    }
  }

  private async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Guard: remove immediately so concurrent calls (or overlapping
    // cleanup) cannot duplicate the PTY kill / container removal work.
    this.sessions.delete(sessionId);

    // Harden: always disconnect, even if kill or container removal fails,
    // so the session store never stays in a stale state.
    try {
      session.pty.kill();
      await stopAndRemoveContainer(session.containerId);
    } catch {
      /* PTY or container already gone — continue to disconnect */
    }
    this.store.disconnect(sessionId);
  }

  async cleanupExpired(): Promise<void> {
    const expired = this.store.cleanupExpired();
    for (const sessionId of expired) {
      const session = this.sessions.get(sessionId);
      if (!session) continue;

      // Same guard as endSession — delete before async cleanup to
      // prevent races with overlapping endSession / cleanup calls.
      this.sessions.delete(sessionId);

      // Harden: one failed container removal must not orphan the
      // rest of the expired sessions in the loop.
      try {
        session.pty.kill();
        await stopAndRemoveContainer(session.containerId);
      } catch {
        /* Container may already be gone — continue to next */
      }
    }
  }

  private send(ws: WebSocket, msg: ServerMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      // Harden: the socket can close between the readyState check
      // and the actual send, so catch any send errors.
      try {
        ws.send(JSON.stringify(msg));
      } catch {
        /* Socket closed between check and send — ignore */
      }
    }
  }

  handleUpgrade(request: IncomingMessage, socket: import('net').Socket, head: Buffer): void {
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.wss.emit('connection', ws, request);
    });
  }
}