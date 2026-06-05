import { z } from 'zod';

export const ConfigSchema = z.object({
  PORT: z.string().default('3001').transform(Number),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  DOCKER_IMAGE: z.string().default('ubuntu:24.04'),
  SESSION_TTL: z.string().default('3600').transform(Number),
  GRACE_PERIOD: z.string().default('300').transform(Number),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const parsed = ConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Config validation failed: ${parsed.error.format()}`);
  }
  return parsed.data;
}