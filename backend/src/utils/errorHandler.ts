import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { InputError } from './errors';

export const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            errors: err.errors.map(e => ({
                path: e.path.join('.'),
                message: e.message
            }))
        });
        return;
    }

    if (err instanceof InputError) {
        res.status(400).json({
            success: false,
            message: err.message
        });
        return;
    }

    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            message: 'Unauthorized: ' + err.message
        });
        return;
    }
    
    res.status(500).json({
        success: false,
        message: 'An internal server error occurred'
    });
}; 