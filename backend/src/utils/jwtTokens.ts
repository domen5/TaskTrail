import jwt from 'jsonwebtoken';

interface JwtTokenArgs {
    _id: string;
    username: string;
    exp: number;
}

const newToken = async (args: JwtTokenArgs, secret: string): Promise<string> => {
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


export { JwtTokenArgs, newToken };