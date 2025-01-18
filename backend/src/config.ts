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

export { PORT, MONGODB_URI };
