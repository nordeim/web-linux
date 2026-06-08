/**
 * Default command policy that blocks dangerous commands.
 */
export const defaultPolicy = {
    denylist: [
        // System destructive commands
        'rm -rf /',
        'rm -rf /*',
        'dd if=/dev/zero of=/dev/sd',
        'mkfs.',
        'format ',
        ':(){ :|:& };:', // Fork bomb
        // Network exfiltration
        'curl -F',
        'wget --post-data',
        'nc -e /bin/sh',
        'ncat -e /bin/sh',
        // Process manipulation
        'kill -9 -1',
        'pkill -9',
        // Privilege escalation
        'sudo su',
        'sudo -i',
        'su -',
        // Docker escape attempts
        'docker.sock',
        '/var/run/docker.sock',
    ],
    maxCommandLength: 1024,
    logCommands: true,
};
export class CommandPolicyEngine {
    policy;
    constructor(policy = defaultPolicy) {
        this.policy = policy;
    }
    /**
     * Evaluate a command against the policy.
     * Returns whether the command is allowed and why.
     */
    evaluate(_sessionId, command) {
        // Check command length
        if (command.length > this.policy.maxCommandLength) {
            return {
                allowed: false,
                command,
                reason: `Command exceeds maximum length of ${this.policy.maxCommandLength} characters`,
            };
        }
        // Check denylist
        for (const blocked of this.policy.denylist) {
            if (command.includes(blocked)) {
                return {
                    allowed: false,
                    command,
                    reason: `Command contains blocked pattern: "${blocked}"`,
                };
            }
        }
        return { allowed: true, command };
    }
    /**
     * Update the policy
     */
    updatePolicy(policy) {
        this.policy = { ...this.policy, ...policy };
    }
    /**
     * Get current policy
     */
    getPolicy() {
        return { ...this.policy };
    }
}
// Singleton instance
export const commandPolicy = new CommandPolicyEngine();
//# sourceMappingURL=policy.js.map