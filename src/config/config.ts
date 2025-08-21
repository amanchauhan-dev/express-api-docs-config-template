import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Zod schema for environment variables
const envVarsSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']),
  PORT: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 3000)),
  SERVER_URL: z.string(),
  DATABASE_URL: z.string(),

  //  JWT 

  JWT_SECRET: z.string(),
  JWT_ACCESS_EXPIRATION_MINUTES: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 15)),
  JWT_REFRESH_EXPIRATION_DAYS: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 30)),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 5)),
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 5)),

  // password

  BCRYPT_SALT_ROUNDS: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 12)),

  // middlewares
  CORS_ORIGIN: z.string().optional().default('*'),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 15 * 60 * 1000)),
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 100)),
  API_PREFIX: z.string().optional().default('/api'),

  // api docs
  API_DOCS_ENABLE: z.enum(["true", "false"]).default("true"),
  API_DOCS_TITLE: z.string().default("My API"),
  API_DOCS_DESCRIPTION: z.string().default("This is my api"),
  API_DOCS_VERSION: z.string().default("1.0.0"),
  API_DOCS_ROUTE: z
    .string()
    .refine((val) => val.startsWith("/"), {
      message: 'API_DOCS_ROUTE must start with "/"',
    })
    .default("/docs"),

  // Email variables
  ACTIVATE_EMAIL: z.enum(["true", "false"]).default("false"),
  EMAIL_ADDRESS: z.string().optional().default("smtp.gmail.com"),
  EMAIL_PORT: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 456)),
  EMAIL_HOST: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  SENDER_NAME: z.string().optional().default("MY API"),
  // OAuth - google
  ACTIVATE_GOOGLE_AUTH: z.enum(["true", "false"]).default("false"),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CLIENT_URL: z.string(),
});

// Parse and validate process.env
const envVars = envVarsSchema.safeParse(process.env);

if (!envVars.success) {
  console.error('Config validation error:', envVars.error.format());
  throw new Error('Invalid environment variables');
}

export const config = {
  env: envVars.data.NODE_ENV,
  port: envVars.data.PORT,
  apiPrefix: envVars.data.API_PREFIX,
  server: {
    url: envVars.data.SERVER_URL
  },
  database: {
    url: envVars.data.DATABASE_URL,
  },

  jwt: {
    secret: envVars.data.JWT_SECRET,
    token: {
      access: {
        expirationMinutes: envVars.data.JWT_ACCESS_EXPIRATION_MINUTES,
      },
      refresh: {
        expirationDays: envVars.data.JWT_REFRESH_EXPIRATION_DAYS,
      },
      resetPassword: {
        expirationMinutes: envVars.data.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
      },
      verifyEmail: {
        expirationMinutes: envVars.data.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
      },
    }
  },

  bcrypt: {
    saltRounds: envVars.data.BCRYPT_SALT_ROUNDS,
  },

  cors: {
    origin: envVars.data.CORS_ORIGIN,
  },

  rateLimit: {
    windowMs: envVars.data.RATE_LIMIT_WINDOW_MS,
    max: envVars.data.RATE_LIMIT_MAX_REQUESTS,
  },

  docs: {
    enable: envVars.data.API_DOCS_ENABLE == "false" ? false : true,
    title: envVars.data.API_DOCS_TITLE,
    description: envVars.data.API_DOCS_DESCRIPTION,
    version: envVars.data.API_DOCS_VERSION,
    route: envVars.data.API_DOCS_ROUTE
  },
  email: {
    activate: envVars.data.ACTIVATE_EMAIL == "true" ? true : false,
    address: envVars.data.EMAIL_ADDRESS,
    password: envVars.data.EMAIL_PASS,
    senderName: envVars.data.SENDER_NAME,
    user: envVars.data.EMAIL_USER,
    port: envVars.data.EMAIL_PORT,
    host: envVars.data.EMAIL_HOST,
  },
  oauth: {
    activate: envVars.data.ACTIVATE_GOOGLE_AUTH == "true" ? true : false,
    secret: envVars.data.GOOGLE_CLIENT_SECRET,
    clientId: envVars.data.GOOGLE_CLIENT_ID,
    clientUrl: envVars.data.GOOGLE_CLIENT_URL,
  }
} as const;
