import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;
let isConnected = false;
let connectionPromise: Promise<void> | null = null;

export const setupTestDB = async () => {
    if (isConnected) {
        return; // Already connected
    }
    
    // If a connection is in progress, wait for it
    if (connectionPromise) {
        await connectionPromise;
        return;
    }
    
    connectionPromise = (async () => {
        try {
            if (mongoose.connection.readyState !== 0) {
                await mongoose.disconnect();
            }
            
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
            isConnected = true;
            console.log('Connected to in-memory database');
        } catch (error) {
            console.error('Error setting up test database:', error);
            throw error;
        } finally {
            connectionPromise = null;
        }
    })();
    
    await connectionPromise;
};

export const teardownTestDB = async () => {
    if (!isConnected) {
        return;
    }
    
    try {
        await mongoose.disconnect();
        await mongoServer.stop();
        isConnected = false;
        console.log('Disconnected from in-memory database');
    } catch (error) {
        console.error('Error tearing down test database:', error);
        throw error;
    }
};

export const clearDatabase = async () => {
    if (!isConnected) {
        await setupTestDB();
    }
    
    const collections = mongoose.connection.collections;
    const clearPromises: Promise<any>[] = [];
    
    for (const key in collections) {
        clearPromises.push(collections[key].deleteMany({}));
    }
    
    // Wait for all deletions to complete in parallel
    await Promise.all(clearPromises);
};
