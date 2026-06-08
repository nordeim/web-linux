import * as pty from 'node-pty';
export interface ContainerSession {
    containerId: string;
    containerName: string;
    pty: pty.IPty;
}
export declare function spawnContainerShell(sessionId: string, onData: (data: string) => void): Promise<ContainerSession>;
export declare function stopAndRemoveContainer(containerId: string): Promise<void>;
//# sourceMappingURL=docker.d.ts.map