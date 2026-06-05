/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import VoiceRecorder from '../VoiceRecorder';

describe('VoiceRecorder', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; },
    };
  })();

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
  });

  afterEach(() => {
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  it('shows a download button for each persisted recording', () => {
    // Seed localStorage with a persisted recording
    localStorageMock.setItem('ubuntuos_recordings', JSON.stringify([
      {
        id: 'test-1',
        name: 'Test Recording',
        duration: 5,
        date: Date.now(),
        waveformData: Array(40).fill(8),
        blobUrl: 'blob:http://localhost/test-1',
      }
    ]));

    render(<VoiceRecorder />);

    // The recording row should render
    expect(screen.getByText('Test Recording')).toBeInTheDocument();

    // There must be a download button/link with the correct aria-label
    const download = screen.getByLabelText('Download recording');
    expect(download).toBeInTheDocument();
    expect(download.tagName.toLowerCase()).toBe('a');
    expect(download).toHaveAttribute('download');
  });
});
