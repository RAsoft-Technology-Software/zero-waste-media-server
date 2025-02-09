import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

// Middleware to protect routes
export const protect = (req: Request, res: Response, next: NextFunction) => {
    try {
        let token: string | undefined;
        if (req.headers.authorization?.startsWith('Bearer')) {
          token = req.headers.authorization.split(' ')[1];
        }
    
        if (!token) {
          return next(new AppError('You are not logged in. Please log in to get access.', 401));
        }
    
        next();
      } catch (error) {
        next(new AppError('Invalid token. Please log in again.', 401));
      }
};
