import { describe, it, expect } from 'vitest';
import { osReducer } from '../useOSStore';
import type { OSState } from '@/types';

// Minimal test state with nextZIndex at the CSS max (2147483646, one below max)
function makeTestState(): OSState {
  return {
    bootPhase: 'logo',
    auth: { isAuthenticated: true, isGuest: false, userName: 'User' },
    windows: [],
    apps: [],
    desktopIcons: [],
    theme: { mode: 'dark', accent: '#7C4DFF', wallpaper: '/wallpaper.jpg' },
    notifications: [],
    dockItems: [],
    contextMenu: { visible: false, x: 0, y: 0, type: 'desktop', items: [] },
    appLauncherOpen: false,
    notificationCenterOpen: false,
    activeWindowId: null,
    nextZIndex: 2147483646, // one below CSS max
    isAltTabbing: false,
    altTabIndex: 0,
  };
}

describe('osReducer z-index cap', () => {
  it('OPEN_WINDOW should cap nextZIndex at CSS max (2147483647)', () => {
    // Start at MAX — after OPEN_WINDOW it should NOT overflow
    const state = { ...makeTestState(), nextZIndex: 2147483647 };
    const next = osReducer(state, { type: 'OPEN_WINDOW', appId: 'terminal' });
    // Without the fix, this would be 2147483648 (overflow)
    expect(next.nextZIndex).toBe(2147483647);
  });

  it('FOCUS_WINDOW should not exceed CSS z-index max', () => {
    const state = makeTestState();
    const next = osReducer(state, { type: 'FOCUS_WINDOW', windowId: 'nonexistent' });
    expect(next.nextZIndex).toBeLessThanOrEqual(2147483647);
  });
});
