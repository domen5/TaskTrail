import express, { Request, Response } from "express";
import { registerUser, retrieveUser } from "../db/userStore";
import bcrypt from 'bcrypt';
import { JWT_SECRET } from "../config";
import { makeToken } from "../utils/auth";

const routes = express.Router();
const tokenExpiry = 30 * 60 * 1000;
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
        if (!req.body.username || !req.body.password) {
            res.status(422).send({ message: 'Username and password are required' });
            return;
        }
        const { username, password } = req.body;
        const foundUser = await retrieveUser({ username, password });
        if (!foundUser) {
            res.status(401).send({ message: 'Invalid username or password' });
            return;
        }
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (isMatch) {
            const token = await makeToken({
                _id: foundUser._id.toString(),
                username: foundUser.username,
                exp: tokenExpiry
            },
                JWT_SECRET);
            res.cookie('token', token, {
                httpOnly: true,
                // secure: true,
                sameSite: 'strict',
                maxAge: tokenExpiry
            });
            res.status(200).send({ message: 'Login successful' });
            return;
        }
        res.status(401).send({ message: 'Invalid username or password' });
    } catch (err) {
        res.status(500).send({ message: 'Something went wrong' });
    }
});

export default routes;