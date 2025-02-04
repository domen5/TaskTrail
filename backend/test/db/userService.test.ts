import 'mocha';
import { expect } from 'chai';
import { registerUser, retrieveUser } from '../../src/db/userStore';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';
import { UserModel } from '../../src/models/User';
import bcrypt from 'bcrypt';

describe('UserService Tests', () => {
    before(async () => {
        await setupTestDB();
    });

    after(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    describe('register', () => {
        it('should create a new user', async () => {
            const user = {
                username: 'testuser',
                password: 'testpassword'
            };
            const result = await registerUser(user);

            expect(result).to.have.property('username', 'testuser');
            expect(result).to.have.property('password', 'testpassword');
            
            const savedUser = await UserModel.findOne({ username: 'testuser' });
            expect(savedUser?.username).to.equal('testuser');
            expect(savedUser?.password).to.not.equal('testpassword');
            const isMatch = await bcrypt.compare('testpassword', savedUser?.password || '');
            expect(isMatch).to.be.true;
        });

        it('should not allow duplicate usernames', async () => {
            const user = {
                username: 'testuser',
                password: 'testpassword'
            };
            await registerUser(user);
            try {
                await registerUser(user);
                expect.fail('Should have thrown an error for duplicate username');
            } catch (err) {
                expect(err).to.exist;
            }
        });

        it('should throw an error for missing username', async () => {
            const user = {
                password: 'testpassword'
            };
            try {
                await registerUser(user as any);
                expect.fail('Should have thrown an error for missing username');
            } catch (err) {
                expect(err).to.exist;
            }
        });

        it('should throw an error for missing password', async () => {
            const user = {
                username: 'testuser'
            };
            try {
                await registerUser(user as any);
                expect.fail('Should have thrown an error for missing password');
            } catch (err) {
                expect(err).to.exist;
            }
        });
    });

    describe('login', () => {
        it('should login a user with correct credentials', async () => {
            const user = {
                username: 'testuser',
                password: 'testpassword'
            };
            await registerUser(user);

            const foundUser = await retrieveUser(user);
            expect(foundUser).to.have.property('username');
            expect(foundUser).to.have.property('password');
            expect(foundUser?.username).to.equal(user.username);
            const isMatch = await bcrypt.compare(user.password, foundUser?.password || '');
            expect(isMatch).to.be.true;
        });

        it('should not login a user with incorrect credentials', async () => {
            const user = {
                username: 'testuser',
                password: 'testpassword'
            };
            await registerUser(user);

            const wrongUser = {
                username: 'testuser',
                password: 'wrongpassword'
            };

            const foundUser = await retrieveUser(wrongUser);
            if (foundUser) {
                const isMatch = await bcrypt.compare(wrongUser.password, foundUser.password);
                expect(isMatch).to.be.false;
            } else {
                expect(foundUser).to.be.null;
            }
        });

        it('should throw an error for non-existent user', async () => {
            const user = {
                username: 'nonexistent',
                password: 'nopassword'
            };

            const foundUser = await retrieveUser(user);
            expect(foundUser).to.be.null;
        });
    });
});
