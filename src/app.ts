import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { database } from './config/database';
import { logger } from './utils/logger';
import { config } from './config/config';
import { rateLimitMiddleware } from './middleware/rateLimit.middleware';
import { errorHandler, notFound } from './middleware/error.middleware';
import { setupSwagger } from './docs/swagger';
import authRoutes from "./routes/auth.route"
import { initCronJobs } from './jobs/cron.jobs';
import oauthRoutes from "./routes/oauth.routes";
import session from "express-session";
import passport from "passport";
import { sendTestEmail } from './controllers/email.controller';
// Remove bodyParser import - not needed

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeDatabase();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  // ========================================== Database ====================
  private async initializeDatabase(): Promise<void> {
    try {
      await database.connect();
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      process.exit(1);
    }
  }

  // ========================================== Middlewares ====================
  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(
      helmet({
        crossOriginEmbedderPolicy: false,
      })
    );

    // CORS configuration
    this.app.use(
      cors({
        origin: "*",
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );

    // Rate limiting
    this.app.use(rateLimitMiddleware);

    // Body parsing middleware - FIXED
    // Remove duplicate body parsers and use only Express built-in ones
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression middleware
    this.app.use(compression());

    // ======  Google oauth
    if (config.oauth.activate) {
      this.app.use(
        session({
          secret: process.env.SESSION_SECRET || "supersecret",
          resave: false,
          saveUninitialized: false,
          cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
          },
        })
      );
      this.app.use(passport.initialize());
      this.app.use(passport.session());
    }
    // ======  end:Google oauth

    // Logging middleware
    if (config.env === 'production') {
      this.app.use(
        morgan('combined', {
          stream: { write: (message: string) => logger.info(message.trim()) },
        })
      );
    } else {
      this.app.use(morgan('dev'));
    }
  }
  // ========================================== Routes ====================
  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      const dbHealth = await database.healthCheck();

      res.status(dbHealth ? 200 : 503).json({
        success: dbHealth,
        message: dbHealth ? 'Server is healthy' : 'Database connection failed',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.env,
        database: dbHealth ? 'connected' : 'disconnected',
      });
    });
    // testv email
    if (config.email.activate)
      this.app.post("/test-email", sendTestEmail);
    // crone jobs
    initCronJobs()
    // API routes
    setupSwagger(this.app);
    this.app.use(`${config.apiPrefix}/auth`, authRoutes);
    if (config.oauth.activate)
      this.app.use(`${config.apiPrefix}/oauth`, oauthRoutes);
  }
  // ========================================== Error Handling ====================

  private initializeErrorHandling(): void {
    this.app.use(notFound);
    this.app.use(errorHandler);
  }

  // ========================================== Server Listening ====================
  public listen(): void {
    this.app.listen(config.port, () => {
      logger.info(
        `🚀 Server running in ${config.env} mode on port ${config.port}`
      );
      logger.info(
        `📱 API available at http://localhost:${config.port}${config.apiPrefix}`
      );
    });
  }
}

const app = new App();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await database.disconnect();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection at:', reason);
  throw reason;
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  app.listen();
}

export default app.app;