import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JWT_SECRET } from '../config';
interface JwtTokenArgs {
    _id: string;
    username: string;
    exp: number;
}

const makeToken = async (args: JwtTokenArgs, secret: string): Promise<string> => {
    if (secret === '') {
        throw new Error('Secret is empty');
    }
    if (args._id === undefined || args.username === undefined) {
        throw new Error('Missing payload fields');
    }
    const token = jwt.sign(
        { _id: args._id.toString(), username: args.username },
        secret,
        { expiresIn: args.exp });
    return token;
};

const verifyToken = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    const token = req.cookies.token;

    if (!token) {
        res.status(401).send({ message: 'Access Denied: No Token Provided!' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtTokenArgs;
        (req as any).user = decoded;
        next();
    } catch (err) {
        res.status(400).send({ message: 'Invalid Token' });
    }
};


export { JwtTokenArgs, makeToken, verifyToken };