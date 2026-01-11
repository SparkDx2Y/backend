import 'express';

// Add user property to Request interface of express
declare module 'express' {
    interface Request {
        user?: {
            id: string;
            role: string;
        };
    }
}
