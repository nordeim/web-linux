// useAuthToken.ts — React hook for JWT token management (dev-only)
// Production should obtain tokens from a backend `/auth/token` endpoint.

import { useCallback } from 'react';
import { useOS } from '@/hooks/useOSStore';
import { generateToken as _generateToken, setToken as _setToken, clearToken as _clearToken } from '@/utils/authToken';

export function useAuthToken() {
  const { state, dispatch } = useOS();

  // Expose the current token from OS state (source of truth)
  const token = state.auth.authToken ?? null;

  // Generate and dispatch token
  const generateToken = useCallback(
    async (userName: string) => {
      const t = await _generateToken(userName);
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
