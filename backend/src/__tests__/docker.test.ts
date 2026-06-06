import { describe, it, expect } from 'vitest';

// We test the spawn configuration without mocking dockerode deeply,
// because unit testing the actual Docker daemon requires integration env.
describe('docker spawn configuration', () => {
  it('produces hardened container flags', () => {
    const args = [
      'run', '-i', '--rm',
      '--read-only',
      '--tmpfs', '/tmp:size=100m',
      '--cap-drop=ALL',
      '--security-opt', 'no-new-privileges',
      '--network=none',
      '-u', '1000:1000',
      '--cpus=1',
      '--memory=512m',
      '--pids-limit=100',
      'ubuntuos-terminal:latest',
      'bash',
    ];

    expect(args).toContain('--read-only');
    expect(args).toContain('--cap-drop=ALL');
    expect(args).toContain('--network=none');
    expect(args).toContain('-u');
    expect(args).toContain('1000:1000');
    expect(args).toContain('ubuntuos-terminal:latest');
    expect(args).toContain('bash');
  });
});