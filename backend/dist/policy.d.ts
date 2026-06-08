import type { CommandPolicy, CommandRestrictionResult } from './types.js';
/**
 * Default command policy that blocks dangerous commands.
 */
export declare const defaultPolicy: CommandPolicy;
export declare class CommandPolicyEngine {
    private policy;
    constructor(policy?: CommandPolicy);
    /**
     * Evaluate a command against the policy.
     * Returns whether the command is allowed and why.
     */
    evaluate(_sessionId: string, command: string): CommandRestrictionResult;
    /**
     * Update the policy
     */
    updatePolicy(policy: Partial<CommandPolicy>): void;
    /**
     * Get current policy
     */
    getPolicy(): CommandPolicy;
}
export declare const commandPolicy: CommandPolicyEngine;
//# sourceMappingURL=policy.d.ts.map