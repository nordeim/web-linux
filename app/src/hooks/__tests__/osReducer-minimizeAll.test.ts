import { describe, it, expect } from "vitest";
import { osReducer } from "../useOSStore";
import type { OSState, Window } from "@/types";

describe("osReducer MINIMIZE_ALL", () => {
  const createWindow = (overrides: Partial<Window> = {}): Window => ({
    id: "test-window-1",
    appId: "test-app",
    title: "Test Window",
    position: { x: 100, y: 200 },
    size: { width: 800, height: 600 },
    state: "normal",
    isFocused: false,
    zIndex: 100,
    icon: "Test",
    createdAt: Date.now(),
    ...overrides,
  });

  const createInitialState = (overrides: Partial<OSState> = {}): OSState => ({
    bootPhase: "desktop",
    auth: { isAuthenticated: true, isGuest: false, userName: "Test" },
    windows: [],
    apps: [],
    desktopIcons: [],
    theme: { mode: "dark", accent: "#7C4DFF", wallpaper: "/wallpaper-default.jpg" },
    notifications: [],
    dockItems: [],
    contextMenu: { visible: false, x: 0, y: 0, type: "desktop", items: [] },
    appLauncherOpen: false,
    notificationCenterOpen: false,
    activeWindowId: null,
    nextZIndex: 100,
    isAltTabbing: false,
    altTabIndex: 0,
    ...overrides,
  });

  it("should set prevPosition and prevSize before minimizing all windows", () => {
    const window1 = createWindow({ id: "win-1", position: { x: 10, y: 20 }, size: { width: 100, height: 200 } });
    const window2 = createWindow({ id: "win-2", position: { x: 30, y: 40 }, size: { width: 300, height: 400 } });

    const state = createInitialState({
      windows: [window1, window2],
      activeWindowId: "win-1",
    });

    const action = { type: "MINIMIZE_ALL" as const };
    const newState = osReducer(state, action);

    // Both windows should be minimized
    expect(newState.windows[0].state).toBe("minimized");
    expect(newState.windows[1].state).toBe("minimized");

    // prevPosition and prevSize should be captured for restoration
    expect(newState.windows[0].prevPosition).toEqual({ x: 10, y: 20 });
    expect(newState.windows[0].prevSize).toEqual({ width: 100, height: 200 });

    expect(newState.windows[1].prevPosition).toEqual({ x: 30, y: 40 });
    expect(newState.windows[1].prevSize).toEqual({ width: 300, height: 400 });

    // activeWindowId should be null since all windows are minimized
    expect(newState.activeWindowId).toBeNull();
  });

  it("should not affect already minimized windows", () => {
    const window1 = createWindow({ id: "win-1", state: "normal", position: { x: 10, y: 20 } });
    const window2 = createWindow({ id: "win-2", state: "minimized", position: { x: 30, y: 40 } });

    const state = createInitialState({
      windows: [window1, window2],
      activeWindowId: "win-1",
    });

    const action = { type: "MINIMIZE_ALL" as const };
    const newState = osReducer(state, action);

    // Window 1 should be minimized with captured position
    expect(newState.windows[0].state).toBe("minimized");
    expect(newState.windows[0].prevPosition).toEqual({ x: 10, y: 20 });

    // Window 2 should remain minimized (not changed)
    expect(newState.windows[1].state).toBe("minimized");
  });

  it("should set activeWindowId to null after minimizing all windows", () => {
    const window1 = createWindow({ id: "win-1" });

    const state = createInitialState({
      windows: [window1],
      activeWindowId: "win-1",
    });

    const action = { type: "MINIMIZE_ALL" as const };
    const newState = osReducer(state, action);

    expect(newState.windows[0].state).toBe("minimized");
    expect(newState.activeWindowId).toBeNull();
  });
});
