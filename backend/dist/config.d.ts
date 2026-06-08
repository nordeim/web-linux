import { z } from 'zod';
export declare const ConfigSchema: z.ZodObject<{
    PORT: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
    JWT_SECRET: z.ZodString;
    DOCKER_IMAGE: z.ZodDefault<z.ZodString>;
    SESSION_TTL: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
    GRACE_PERIOD: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
}, z.core.$strip>;
export type Config = z.infer<typeof ConfigSchema>;
export declare function loadConfig(): Config;
//# sourceMappingURL=config.d.ts.map