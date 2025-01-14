import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import routes from './api/routes';

dotenv.config();
console.log(process.env.PORT);

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

app.use(express.json());

app.use('/api', routes);

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});