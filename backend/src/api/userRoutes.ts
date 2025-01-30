import express, { Request, Response } from "express";
import User, { UserModel } from "../models/User";
import { register } from "../db/userService";

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
    const { username, password } = req.body;
    try {
        const user = await UserModel.findOne({ username, password });
        res.status(200).send(user);
    } catch (err) {
        res.status(500).send({ message: 'Something went wrong' });
    }
});

export default routes;