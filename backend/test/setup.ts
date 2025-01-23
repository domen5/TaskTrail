import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export const setupTestDB = async () => {
    try {
        await mongoose.disconnect();  // Disconnect from any existing connection
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        console.log('Connected to in-memory database');
    } catch (error) {
        console.error('Error setting up test database:', error);
        throw error;
    }
};

export const teardownTestDB = async () => {
    try {
        await mongoose.disconnect();
        await mongoServer.stop();
        console.log('Disconnected from in-memory database');
    } catch (error) {
        console.error('Error tearing down test database:', error);
        throw error;
    }
};

// Optional: Add a helper to clear the database between tests
export const clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
}; 