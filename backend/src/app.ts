import { initializeDatabase } from './db/dataStore';
import routes from './routes/routes';
import userRoutes from './routes/userRoutes';
import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PORT, FRONTEND_URLS } from "./config"
import projectRoutes from './routes/projectRoutes';
import swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';
import customerRoutes from './routes/customer.routes';

async function startServer() {
    await initializeDatabase();

    const app = express();
    app.use(express.json());
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
    app.use('/api/project', projectRoutes);
    app.use('/api/customers', customerRoutes);

    const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'swagger.json'), 'utf8'));
    app.get('/api/swagger.json', (req, res) => {
        res.json(swaggerDocument);
    });
    app.use('/documentation', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    
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
