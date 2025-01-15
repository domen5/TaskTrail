import routes from './api/routes';
import express, { Request, Response } from 'express';
import cors from 'cors';

import { PORT } from "./config"

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api', routes);

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
