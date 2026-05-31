// ============================================================
// WindowManager — Renders all open windows, manages z-index
// ============================================================

import { memo } from 'react';
import { useOS } from '@/hooks/useOSStore';
import WindowFrame from './WindowFrame';
import AppRouter from '@/apps/AppRouter';
import GlobalErrorBoundary from './GlobalErrorBoundary';

const WindowManager = memo(function WindowManager() {
  const { state } = useOS();
  const visibleWindows = state.windows.filter((w) => w.state !== 'minimized');

  return (
    <>
      {visibleWindows.map((win) => (
        <WindowFrame key={win.id} window={win}>
          <GlobalErrorBoundary>
            <AppRouter appId={win.appId} windowId={win.id} />
          </GlobalErrorBoundary>
        </WindowFrame>
      ))}
    </>
  );
});

export default WindowManager;
