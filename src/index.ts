import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mediaRoutes from './routes/mediRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4004;
const bodyLimit = process.env.MAX_FILE_SIZE || '25mb';
// const origin = process.env.ORIGIN?.split(',') || '*';

// Middleware
// app.use(limiter);
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));
// app.use(cors({ origin }));
app.use(cors({
    origin: '*', // Allow all origins (for testing)
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    exposedHeaders: ['Content-Length'], // Allow the frontend to read headers
}));

// 🔥 **CSP Fix: Allow Image Loading From Backend**
app.use(
    (req, res, next) => {
      res.setHeader("Content-Security-Policy", "default-src *; img-src * data: blob:;");
      next();
    }
);

// Routes
app.use('/api/media', mediaRoutes);

// Default route
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the Media Server API",
        description: "Handles media upload, processing, and management.",
        version: "2.0.0"
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`Media Server running on port ${PORT}`);
});