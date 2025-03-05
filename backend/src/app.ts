import { initializeDatabase } from './db/dataStore';
import routes from './api/routes';
import userRoutes from './api/userRoutes';
import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PORT, FRONTEND_URLS } from "./config"
import organizationRoutes from './api/organizationRoutes';
import projectRoutes from './api/projectRoutes';

async function startServer() {
    await initializeDatabase();

    const app = express();
    app.use(express.json());
    // TODO: Retrieve frontend url from env
    const allowedOrigins = FRONTEND_URLS.split(' ');

    app.use(cors({
        origin: (origin, callback) => {
            // Allow requests from any origin if origin is not present to allow Postman requests
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true
    }));
    app.use(cookieParser());
    app.use('/api', routes);
    app.use('/api/user', userRoutes);
    app.use('/api/organization', organizationRoutes);
    app.use('/api/project', projectRoutes);
    
    app.get('/', (req: Request, res: Response) => {
        res.send('Hello, World!');
    });

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });

    return app;
}

const app = startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

export default app;
