// useAuthToken.ts — React hook for JWT token management
// Dev: generates locally; Production: calls backend /auth/token endpoint.

import { useCallback } from 'react';
import { useOS } from '@/hooks/useOSStore';
import { BACKEND_BASE } from '@/utils/backendUrl';
import { generateToken as _generateToken, clearToken as _clearToken } from '@/utils/authToken';

async function fetchToken(userName: string): Promise<string> {
  const res = await fetch(`${BACKEND_BASE}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName }),
  });
  if (!res.ok) throw new Error('Failed to fetch auth token');
  const { token } = (await res.json()) as { token: string };
  return token;
}

export function useAuthToken() {
  const { state, dispatch } = useOS();

  // Expose the current token from OS state (source of truth)
  const token = state.auth.authToken ?? null;

  // Generate and dispatch token
  const generateToken = useCallback(
    async (userName: string) => {
      const t = import.meta.env.DEV
        ? await _generateToken(userName)
        : await fetchToken(userName);
      dispatch({ type: 'SET_AUTH_TOKEN', token: t });
      return t;
    },
    [dispatch]
  );

  // On LOGOUT, clear in-memory token
  const clearToken = useCallback(() => {
    _clearToken();
    dispatch({ type: 'SET_AUTH_TOKEN', token: '' });
  }, [dispatch]);

  return { token, generateToken, clearToken };
}
