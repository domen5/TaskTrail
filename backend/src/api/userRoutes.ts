import express, { Request, Response } from "express";
import { registerUser, retrieveUser } from "../db/userStore";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config";
const routes = express.Router();

routes.post('/register', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        await registerUser({ username, password });
        res.status(201).send({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).send({ message: 'Something went wrong' });
    }
});

routes.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const foundUser = await retrieveUser({ username, password });
        if (!foundUser) {
            res.status(401).send({ message: 'Invalid username or password' });
            return;
        }
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (isMatch) {
            // TODO: Lookup if async version is available
            const token = jwt.sign(
                {_id: foundUser._id.toString(), username: foundUser.username},
                JWT_SECRET,
                {expiresIn: 30*60*1000});
            res.status(200).send({ token });
            return;
        }
        res.status(401).send({ message: 'Invalid username or password' });
    } catch (err) {
        res.status(500).send({ message: 'Something went wrong' });
    }
});

export default routes;