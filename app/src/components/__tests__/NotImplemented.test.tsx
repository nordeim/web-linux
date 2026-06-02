import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import NotImplemented from '../NotImplemented';

describe('NotImplemented', () => {
  it('renders the "Coming Soon" view for a known app without errors', () => {
    // This should not throw a ReferenceError about `Icons`
    const { container } = render(<NotImplemented appId="terminal" />);
    expect(container.textContent).toContain('Coming Soon');
  });

  it('renders the "Unknown App" view for an unknown app without errors', () => {
    // This should not throw a ReferenceError about `Icons`
    const { container } = render(<NotImplemented appId="nonexistent-app-id" />);
    expect(container.textContent).toContain('Unknown App');
  });
});
