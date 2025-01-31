import express, { Request, Response } from "express";
import { login, register } from "../db/userService";
import bcrypt from 'bcrypt';
const routes = express.Router();

routes.post('/register', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        await register({ username, password });
        res.status(201).send({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).send({ message: 'Something went wrong' });
    }
});

routes.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const user = await login({ username, password });
        if (!user) {
            res.status(401).send({ message: 'Invalid username or password' });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).send({ message: 'Invalid username or password' });
            return;
        }
        res.status(200).send(user);
    } catch (err) {
        res.status(500).send({ message: 'Something went wrong' });
    }
});

export default routes;