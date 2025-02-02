import { initializeDatabase } from './db/dataStore';
import routes from './api/routes';
import userRoutes from './api/userRoutes';
import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PORT } from "./config"

async function startServer() {
    await initializeDatabase();

    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use(cookieParser());
    app.use('/api', routes);
    app.use('/api/user', userRoutes);
    
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
