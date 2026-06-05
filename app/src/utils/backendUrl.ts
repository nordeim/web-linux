// Centralised backend URL configuration.
// Override at build time via VITE_BACKEND_URL / VITE_BACKEND_WS.
export const BACKEND_BASE = ((import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:3001').replace(/\/$/, '');
export const BACKEND_WS = ((import.meta.env.VITE_BACKEND_WS as string | undefined) ?? 'ws://localhost:3001').replace(/\/$/, '');
