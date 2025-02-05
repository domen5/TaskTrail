import { Schema, model } from 'mongoose';

const BlacklistSchema = new Schema({
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '1d' } // Automatically remove after 1 day
});

const TokenVersionSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    version: { type: Number, default: 1 }
});

const Blacklist = model('Blacklist', BlacklistSchema);
const TokenVersion = model('TokenVersion', TokenVersionSchema);

const addToBlacklist = async (token: string) => {
    await Blacklist.create({ token });
};

const isTokenBlacklisted = async (token: string): Promise<boolean> => {
    const result = await Blacklist.findOne({ token });
    return !!result;
};

const getTokenVersion = async (userId: string): Promise<number> => {
    const record = await TokenVersion.findOne({ userId });
    return record ? record.version : 1;
};

const incrementTokenVersion = async (userId: string) => {
    const existingRecord = await TokenVersion.findOne({ userId });
    if (!existingRecord) {
        throw new Error(`Token version record not found for user ${userId}`);
    }
    const result = await TokenVersion.findOneAndUpdate(
        { userId },
        { $inc: { version: 1 } },
        { new: true }
    );
    console.log(`Incremented token version for user ${userId}:`, result?.version);
};

export { addToBlacklist, isTokenBlacklisted, getTokenVersion, incrementTokenVersion, TokenVersion };
