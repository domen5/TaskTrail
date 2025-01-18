db = connect("localhost/admin");

const dbName = process.env.DB_NAME || 'test';
const username = process.env.USERNAME || 'root';
const password = process.env.PASSWORD || 'example';

db = db.getSiblingDB(dbName);

db.createUser({
  user: username,
  pwd: password,
  roles: [
    {
      role: "readWrite",
      db: dbName,
    },
  ],
});

print(`Database '${dbName}' and user '${username}' created with readWrite permissions.`);
