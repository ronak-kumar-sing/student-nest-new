import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string().optional().default('redis://localhost:6379'),
  TYPESENSE_API_KEY: z.string().optional().default('xyz123'),
  TYPESENSE_HOST: z.string().optional().default('localhost'),
  TYPESENSE_PORT: z.coerce.number().optional().default(8108),
  TYPESENSE_PROTOCOL: z.enum(['http', 'https']).optional().default('http'),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:4000'),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  // Cloudinary (Media Storage)
  CLOUDINARY_CLOUD_NAME: z.string().optional().default('demo'),
  CLOUDINARY_API_KEY: z.string().optional().default('demo_api_key'),
  CLOUDINARY_API_SECRET: z.string().optional().default('demo_api_secret'),
  CLOUDINARY_UPLOAD_PRESET: z.string().optional().default('student_nest_unsigned'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const formattedErrors = parsed.error.issues
      .map((issue) => `[${issue.path.join('.')}] ${issue.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${formattedErrors}`);
  }

  return parsed.data;
}
