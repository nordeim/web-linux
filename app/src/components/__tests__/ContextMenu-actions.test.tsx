import { describe, it, expect, vi } from 'vitest';
import type { OSAction } from '@/types';
import { handleMenuAction } from '../ContextMenu';

const makeMockDispatch = () => vi.fn<(action: OSAction) => void>();

describe('ContextMenu > handleMenuAction', () => {
  const baseState: import('@/types').OSState = {
    bootPhase: 'desktop',
    auth: { isAuthenticated: true, isGuest: false, userName: 'Test' },
    windows: [],
    apps: [],
    desktopIcons: [],
    theme: { mode: 'dark', accent: '#7C4DFF', wallpaper: '' },
    notifications: [],
    dockItems: [],
    contextMenu: { visible: false, x: 0, y: 0, type: 'desktop', items: [] },
    appLauncherOpen: false,
    notificationCenterOpen: false,
    activeWindowId: null,
    nextZIndex: 100,
    isAltTabbing: false,
    altTabIndex: 0,
  };

  it('NEW_FOLDER dispatches ADD_DESKTOP_ICON', () => {
    const dispatch = makeMockDispatch();
    handleMenuAction('NEW_FOLDER', baseState, dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ADD_DESKTOP_ICON',
        icon: expect.objectContaining({ name: 'New Folder', icon: 'Folder' }),
      })
    );
  });

  it('NEW_DOCUMENT dispatches ADD_DESKTOP_ICON', () => {
    const dispatch = makeMockDispatch();
    handleMenuAction('NEW_DOCUMENT', baseState, dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ADD_DESKTOP_ICON',
        icon: expect.objectContaining({ name: 'New Document', icon: 'FileText' }),
      })
    );
  });

  it('OPEN_TERMINAL dispatches OPEN_WINDOW for terminal app', () => {
    const dispatch = makeMockDispatch();
    handleMenuAction('OPEN_TERMINAL', baseState, dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'OPEN_WINDOW', appId: 'terminal' })
    );
  });

  it('CHANGE_BG dispatches OPEN_WINDOW for settings app', () => {
    const dispatch = makeMockDispatch();
    handleMenuAction('CHANGE_BG', baseState, dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'OPEN_WINDOW', appId: 'settings' })
    );
  });

  it('SHOW_SETTINGS dispatches OPEN_WINDOW for settings app', () => {
    const dispatch = makeMockDispatch();
    handleMenuAction('SHOW_SETTINGS', baseState, dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'OPEN_WINDOW', appId: 'settings' })
    );
  });

  it('ARRANGE_ICONS dispatches CASCADE_WINDOWS', () => {
    const dispatch = makeMockDispatch();
    handleMenuAction('ARRANGE_ICONS', baseState, dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'CASCADE_WINDOWS' })
    );
  });
});
