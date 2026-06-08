import 'dotenv/config';
import http from 'http';
import express from 'express';
import { WebSocketHandler } from './websocket.js';
import { SessionStore } from './sessionStore.js';
import { generateToken, verifyToken } from './auth.js';
import { loadConfig } from './config.js';
import rateLimit from 'express-rate-limit';
const config = loadConfig();
const app = express();
const server = http.createServer(app);
app.use(express.json());
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || 'unknown',
    handler: (_req, res) => {
        res.status(429).json({ error: 'Too many requests' });
    },
});
app.post('/auth/token', rateLimiter, async (req, res) => {
    try {
        const { userName } = req.body;
        if (!userName || typeof userName !== 'string') {
            res.status(400).json({ error: 'userName is required' });
            return;
        }
        const token = await generateToken(userName);
        res.json({ token });
    }
    catch {
        res.status(500).json({ error: 'Failed to generate token' });
    }
});
const verify = async (token) => {
    const payload = await verifyToken(token, config.JWT_SECRET);
    return payload !== null;
};
const store = new SessionStore({
    gracePeriodMs: config.GRACE_PERIOD,
    ttlMs: config.SESSION_TTL * 1000,
});
const wsHandler = new WebSocketHandler({ store, verifyToken: verify });
setInterval(() => {
    void wsHandler.cleanupExpired();
}, 60000);
server.on('upgrade', (request, socket, head) => {
    if (request.url?.startsWith('/ws')) {
        wsHandler.handleUpgrade(request, socket, head);
    }
    else {
        socket.destroy();
    }
});
server.listen(config.PORT, () => {
    console.log(`Backend listening on port ${config.PORT}`);
});
//# sourceMappingURL=index.js.map