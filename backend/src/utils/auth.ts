import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { JWT_SECRET } from '../config';
import { isTokenBlacklisted, getTokenVersion } from '../db/tokenStore';
import { AuthRequest } from '../types/auth';

interface JwtTokenArgs {
    _id: string;
    username: string;
    exp: number;
    version: number;
}

const makeToken = async (args: JwtTokenArgs, secret: string): Promise<string> => {
    if (secret === '') {
        throw new Error('Secret is empty');
    }
    if (args._id === undefined || args.username === undefined || args.version === undefined) {
        throw new Error('Missing payload fields');
    }
    const token = jwt.sign(
        { _id: args._id.toString(), username: args.username, version: args.version },
        secret,
        { expiresIn: args.exp });
    return token;
};

const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies.token;

    if (!token) {
        res.status(401).send({ message: 'Access Denied: No Token Provided!' });
        return;
    }

    if (await isTokenBlacklisted(token)) {
        res.status(401).send({ message: 'Access Denied: Token is blacklisted!' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtTokenArgs;
        const currentVersion = await getTokenVersion(decoded._id);
        if (decoded.version < currentVersion) {
            res.status(401).send({ message: 'Access Denied: Token version is outdated!' });
            return;
        }
        console.log(`Decoded token version: ${decoded.version}, Current version: ${currentVersion}`);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.message.includes('Token version record not found')) {
            res.status(500).send({ message: 'Internal Server Error: Token version record missing' });
            return;
        }
        res.status(400).send({ message: 'Invalid Token' });
    }
};

export { JwtTokenArgs, makeToken, verifyToken };
