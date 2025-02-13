import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

// Read config from .env file
const PORT: number = Number(process.env.PORT) || 3000;
const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://root:pass12345@mongodb:27017/tasktrail'
const JWT_SECRET: string = process.env.JWT_SECRET || 'VerySecretKey';
const FRONTEND_URLS: string = process.env.FRONTEND_URLS || 'http://localhost:5173 http://localhost:8080';
const PRIVATE_KEY_PATH: string = process.env.PRIVATE_KEY_PATH;
const CERTIFICATE_PATH: string = process.env.CERTIFICATE_PATH;
export { PORT, MONGODB_URI, JWT_SECRET, FRONTEND_URLS, PRIVATE_KEY_PATH, CERTIFICATE_PATH };
