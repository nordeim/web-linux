import Docker from 'dockerode';
import * as pty from 'node-pty';

const docker = new Docker();

export interface ContainerSession {
  containerId: string;
  containerName: string;
  pty: pty.IPty;
}

function spawnAttachment(containerName: string, onData: (data: string) => void): pty.IPty {
  const ptyProcess = pty.spawn('docker', ['attach', containerName], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    env: process.env as { [key: string]: string },
  });

  ptyProcess.onData(onData);
  return ptyProcess;
}

export async function spawnContainerShell(
  sessionId: string,
  onData: (data: string) => void
): Promise<ContainerSession> {
  const containerName = `ubuntuos-term-${sessionId}`;

  // Check for an existing container (reconnection)
  try {
    const existing = docker.getContainer(containerName);
    const info = await existing.inspect();
    if (info.State.Running) {
      const ptyProcess = spawnAttachment(containerName, onData);
      return {
        containerId: info.Id,
        containerName,
        pty: ptyProcess,
      };
    }
    // Exists but not running — remove it before recreating
    await existing.remove({ force: true });
  } catch {
    // Container does not exist — proceed to create
  }

  const container = await docker.createContainer({
    Image: process.env.DOCKER_IMAGE ?? 'ubuntuos-terminal:latest',
    Cmd: ['bash'],
    name: containerName,
    HostConfig: {
      ReadonlyRootfs: true,
      Tmpfs: { '/tmp': 'size=100m' },
      CapDrop: ['ALL'],
      SecurityOpt: ['no-new-privileges:true'],
      NetworkMode: 'none',
      CpuCount: 1,
      Memory: 512 * 1024 * 1024,
      PidsLimit: 100,
    },
    User: '1000:1000',
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    OpenStdin: true,
    StdinOnce: false,
  });

  await container.start();
  await new Promise<void>((resolve) => setTimeout(resolve, 500));

  const ptyProcess = spawnAttachment(containerName, onData);

  return {
    containerId: container.id,
    containerName,
    pty: ptyProcess,
  };
}

export async function stopAndRemoveContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  try {
    await container.stop({ t: 2 });
  } catch {
    // Already stopped or gone
  }
  try {
    await container.remove({ force: true });
  } catch {
    // Already removed or gone
  }
}