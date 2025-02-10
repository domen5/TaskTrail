import 'mocha';
import { expect } from 'chai';
import { registerUser, retrieveUser } from '../../src/db/userStore';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';
import { UserModel, Role } from '../../src/models/User';
import { OrganizationModel } from '../../src/models/Organization';
import bcrypt from 'bcrypt';
import { Types } from 'mongoose';

describe('UserService Tests', () => {
    let testOrgId: Types.ObjectId;
    const testRole: Role = 'basic';

    before(async () => {
        await setupTestDB();
    });

    after(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearDatabase();
        // Create a test organization
        const org = await OrganizationModel.create({ name: 'testorganization' });
        testOrgId = org._id;
    });

    describe('register', () => {
        it('should create a new user', async () => {
            const user = {
                username: 'testuser',
                password: 'testpassword',
                organization: testOrgId,
                role: testRole
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
                password: 'testpassword',
                organization: testOrgId,
                role: testRole
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
                password: 'testpassword',
                organization: testOrgId,
                role: testRole
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
                username: 'testuser',
                organization: testOrgId,
                role: testRole
            };
            try {
                await registerUser(user as any);
                expect.fail('Should have thrown an error for missing password');
            } catch (err) {
                expect(err).to.exist;
            }
        });

        it('should set timestamps when creating a new user', async () => {
            const user = {
                username: 'timestampuser',
                password: 'testpassword',
                organization: testOrgId,
                role: testRole
            };
            
            const before = new Date();
            const result = await registerUser(user);
            const after = new Date();
            
            const savedUser = await UserModel.findOne({ username: 'timestampuser' });
            expect(savedUser).to.exist;
            
            // Ensure savedUser exists before checking timestamps
            if (!savedUser) {
                throw new Error('User not found after creation');
            }
            
            expect(savedUser.createdAt).to.exist;
            expect(savedUser.updatedAt).to.exist;
            
            expect(savedUser.createdAt!.getTime()).to.be.at.least(before.getTime());
            expect(savedUser.createdAt!.getTime()).to.be.at.most(after.getTime());
            expect(savedUser.updatedAt!.getTime()).to.equal(savedUser.createdAt!.getTime());
        });

        it('should update the updatedAt timestamp when modifying a user', async () => {
            const user = {
                username: 'updateuser',
                password: 'testpassword',
                organization: testOrgId,
                role: testRole
            };
            await registerUser(user);
            
            // Wait a small amount to ensure timestamp difference
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Update the user
            const savedUser = await UserModel.findOne({ username: 'updateuser' });
            if (!savedUser) {
                throw new Error('User not found after creation');
            }
            
            const originalUpdatedAt = savedUser.updatedAt;
            if (!originalUpdatedAt) {
                throw new Error('UpdatedAt timestamp not set');
            }
            
            const before = new Date();
            savedUser.password = 'newpassword';
            await savedUser.save();
            const after = new Date();
            
            const updatedUser = await UserModel.findOne({ username: 'updateuser' });
            if (!updatedUser || !updatedUser.updatedAt || !updatedUser.createdAt) {
                throw new Error('Updated user or timestamps not found');
            }
            
            expect(updatedUser.updatedAt.getTime()).to.be.above(originalUpdatedAt.getTime());
            expect(updatedUser.updatedAt.getTime()).to.be.at.least(before.getTime());
            expect(updatedUser.updatedAt.getTime()).to.be.at.most(after.getTime());
            expect(updatedUser.createdAt.getTime()).to.equal(savedUser.createdAt!.getTime());
        });
    });

    describe('retrieveUser', () => {
        it('should retrieve a user with correct username', async () => {
            const user = {
                username: 'testuser',
                password: 'testpassword',
                organization: testOrgId,
                role: testRole
            };
            await registerUser(user);

            const foundUser = await retrieveUser('testuser');
            expect(foundUser).to.have.property('username');
            expect(foundUser).to.have.property('password');
            expect(foundUser?.username).to.equal(user.username);
            const isMatch = await bcrypt.compare(user.password, foundUser?.password || '');
            expect(isMatch).to.be.true;
        });

        it('should return null for non-existent user', async () => {
            const foundUser = await retrieveUser('nonexistent');
            expect(foundUser).to.be.null;
        });
    });
});
