// migrate-mongo configuration
require('dotenv').config({ path: './.env' });

const config = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://root:pass12345@mongodb:27017/tasktrail',
    databaseName: process.env.DB_NAME || 'tasktrail',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false
};

module.exports = config;

