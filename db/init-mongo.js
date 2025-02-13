db = connect("localhost/admin");

const dbName = process.env.DB_NAME || 'test';
const username = encodeURIComponent(process.env.USERNAME || 'root');
const password = encodeURIComponent(process.env.PASSWORD || 'example');

db = db.getSiblingDB(dbName);

try {
    db.dropUser(username);
    print(`Existing user '${username}' deleted.`);
} catch (error) {
    print(`No existing user '${username}' found.`);
}

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
