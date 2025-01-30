import 'mocha';
import { expect } from 'chai';
import { register, login } from '../../src/db/userService';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';
import { UserModel } from '../../src/models/User';

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
            const result = await register(user);

            expect(result).to.have.property('username', 'testuser');
            expect(result).to.have.property('password', 'testpassword');
            
            const savedUser = await UserModel.findOne({ username: 'testuser', password: 'testpassword' });
            expect(savedUser?.username).to.equal('testuser');
            expect(savedUser?.password).to.equal('testpassword');
        });

        it('should not allow duplicate usernames', async () => {
            const user = {
                username: 'testuser',
                password: 'testpassword'
            };
            await register(user);
            try {
                await register(user);
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
                await register(user as any);
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
                await register(user as any);
                expect.fail('Should have thrown an error for missing password');
            } catch (err) {
                expect(err).to.exist;
            }
        });
    });
});
