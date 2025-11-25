import express, { Request, Response } from "express";
import { registerUser, retrieveUser } from "../db/userStore";
import bcrypt from 'bcrypt';
import { JWT_SECRET } from "../config";
import { makeToken, verifyToken } from "../utils/auth";
import { incrementTokenVersion, addToBlacklist, getTokenVersion } from '../db/tokenStore';
import { TokenVersion } from '../db/tokenStore';
import { loginRequestSchema, registerRequestSchema } from '../schemas/requestSchemas';

const routes = express.Router();
const TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes

routes.post('/register', async (req: Request, res: Response) => {
    try {
        // Validate request body
        const bodyResult = registerRequestSchema.safeParse(req.body);
        if (!bodyResult.success) {
            res.status(400).json({
                message: 'Invalid request body',
                errors: bodyResult.error.flatten().fieldErrors
            });
            return;
        }

        const { username, password, role } = bodyResult.data;

        try {
            await registerUser({ username, password, role });
            res.status(201).json({ message: 'User registered successfully' });
        } catch (err: any) {
            if (err.code === 11000 || err.name === 'ValidationError') {
                res.status(400).json({ message: 'Invalid registration data' });
            } else {
                throw err;
            }
        }
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

routes.post('/login', async (req: Request, res: Response) => {
    try {
        // Validate request body
        const bodyResult = loginRequestSchema.safeParse(req.body);
        if (!bodyResult.success) {
            res.status(400).json({
                message: 'Invalid request body',
                errors: bodyResult.error.flatten().fieldErrors
            });
            return;
        }
        
        const { username, password } = bodyResult.data;

        const foundUser = await retrieveUser(username);
        if (!foundUser) {
            res.status(401).send({ message: 'Invalid username or password' });
            return;
        }

        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
            res.status(401).send({ message: 'Invalid username or password' });
            return;
        }

        let tokenVersion: number;
        try {
            tokenVersion = await getTokenVersion(foundUser._id.toString());
        } catch (err) {
            if (err.message === 'Token version record not found') {
                await TokenVersion.create({ userId: foundUser._id.toString(), version: 1 });
                tokenVersion = 1;
            } else {
                throw err;
            }
        }
        
        const token = await makeToken({
            _id: foundUser._id.toString(),
            username: foundUser.username,
            exp: TOKEN_EXPIRY,
            version: tokenVersion
        }, JWT_SECRET);
        res.cookie('token', token, {
            httpOnly: true,
            // secure: true,
            sameSite: 'strict',
            maxAge: TOKEN_EXPIRY
        });
        res.status(200).send({ message: 'Login successful', expiresIn: TOKEN_EXPIRY });
    } catch (err) {
        res.status(500).send({ message: 'Something went wrong' });
    }
});

routes.get('/verify', verifyToken, async (req: Request, res: Response) => {
    const user = (req as any).user;
    res.status(200).send({ message: 'Token is valid', user, expiresIn: TOKEN_EXPIRY });
});

routes.post('/logout', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (token) {
            await addToBlacklist(token);
        }
        res.clearCookie('token', {
            httpOnly: true,
            // secure: true,
            sameSite: 'strict'
        });
        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        res.status(500).json({ message: 'Error during logout' });
    }
});

routes.post('/refresh-token', verifyToken, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        const oldToken = req.cookies.token;
        await addToBlacklist(oldToken);

        await incrementTokenVersion(user._id);

        const newVersion = await getTokenVersion(user._id);
        const newToken = await makeToken({
            _id: user._id,
            username: user.username,
            exp: TOKEN_EXPIRY,
            version: newVersion
        }, JWT_SECRET);

        res.cookie('token', newToken, {
            httpOnly: true,
            // secure: true,
            sameSite: 'strict',
            maxAge: TOKEN_EXPIRY
        });
        res.status(200).send({ message: 'Token refreshed successfully', expiresIn: TOKEN_EXPIRY });
    } catch (err) {
        res.status(500).send({ message: 'Something went wrong' });
    }
});

export default routes;
