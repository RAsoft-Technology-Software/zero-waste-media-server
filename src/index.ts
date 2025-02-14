import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import mediaRoutes from './routes/mediRoutes';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const bodyLimit = process.env.MAX_FILE_SIZE || '25mb';
const origin = process.env.ORIGIN?.split(',') || '*';

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests
    message: "Too many requests from this IP, please try again later.",
    handler: (req, res, next, options) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(options.statusCode).json({
            message: options.message,
            status: 'fail'
        });
    }
});

// Middleware
app.use(limiter);
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));
// app.use(cors({ origin }));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type']
  }));
  
app.use(helmet());

// Routes
app.use('/api/media', mediaRoutes);

// Default route
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the Media Server API",
        description: "Handles media upload, processing, and management.",
        version: "1.0.0"
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Unhandled error: ${err.message}`);
  
    res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  });

app.listen(PORT, () => {
    console.log(`Media Server running on port ${PORT}`);
});
