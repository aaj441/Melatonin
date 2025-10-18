import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  BASE_URL: z.string().optional(),
  BASE_URL_OTHER_PORT: z.string().optional(),
  ADMIN_PASSWORD: z.string(),
  JWT_SECRET: z.string(),
  OPENROUTER_API_KEY: z.string(),
  OPENAI_API_KEY: z.string().optional(), // For Whisper transcription
  
  // Stripe integration
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_PUBLISHABLE_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
