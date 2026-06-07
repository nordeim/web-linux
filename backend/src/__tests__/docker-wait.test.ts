// ============================================================
// Docker container wait helper test (TDD)
// Verifies that waitForContainer polls until container is running.
//
// Bug: docker.ts uses a magic setTimeout(500) after container.start()
// which is fragile and may fail under host load.
// ============================================================

import { describe, it, expect, vi } from 'vitest';

async function waitForContainer(
  container: { inspect: () => Promise<{ State: { Running: boolean } }> },
  timeoutMs = 5000,
  pollInterval = 10,
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const info = await container.inspect();
    if (info.State.Running) {
      return;
    }
    await new Promise<void>((resolve) => setTimeout(resolve, pollInterval));
  }
  throw new Error('Container failed to start within timeout');
}

describe('waitForContainer', () => {
  it('resolves when container is already running', async () => {
    const mockInspect = vi.fn().mockResolvedValueOnce({ State: { Running: true } });
    await expect(waitForContainer({ inspect: mockInspect })).resolves.toBeUndefined();
    expect(mockInspect).toHaveBeenCalledTimes(1);
  });

  it('polls until container is running', async () => {
    const mockInspect = vi.fn()
      .mockResolvedValueOnce({ State: { Running: false } })
      .mockResolvedValueOnce({ State: { Running: false } })
      .mockResolvedValueOnce({ State: { Running: true } });

    await expect(waitForContainer({ inspect: mockInspect })).resolves.toBeUndefined();
    expect(mockInspect).toHaveBeenCalledTimes(3);
  });

  it('throws on timeout', async () => {
    const mockInspect = vi.fn().mockResolvedValue({ State: { Running: false } });
    await expect(waitForContainer({ inspect: mockInspect }, 50, 10)).rejects.toThrow('Container failed to start within timeout');
    expect(mockInspect.mock.calls.length).toBeGreaterThanOrEqual(1);
  });
});
