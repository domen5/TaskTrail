import 'mocha';
import { expect } from 'chai';
import { registerUser, retrieveUser } from '../../src/db/userStore';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';
import { UserModel, Role } from '../../src/models/User';
import { OrganizationModel } from '../../src/models/Organization';
import bcrypt from 'bcrypt';
import { Types } from 'mongoose';

describe('UserStore Tests', () => {
    let testOrgId: Types.ObjectId;
    const testRole: Role = 'regular';

    async function createTestUser(overrides = {}) {
        const baseUser = {
            username: 'testuser',
            password: 'testpassword',
            organization: testOrgId,
            role: testRole
        };
        return await registerUser({ ...baseUser, ...overrides });
    }

    before(async () => {
        await setupTestDB();
    });

    after(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearDatabase();
        const org = await OrganizationModel.create({ name: 'testorganization' });
        testOrgId = org._id;
    });

    describe('register', () => {
        it('should create a new user', async () => {
            const result = await createTestUser();

            expect(result).to.have.property('username', 'testuser');
            expect(result).to.have.property('password').that.is.not.equal('testpassword');
            expect(result.organization.toString()).to.equal(testOrgId.toString());
            expect(result.role).to.equal(testRole);

            const savedUser = await UserModel.findOne({ username: 'testuser' });
            expect(savedUser?.username).to.equal('testuser');
            expect(savedUser?.password).to.not.equal('testpassword');
            const isMatch = await bcrypt.compare('testpassword', savedUser?.password || '');
            expect(isMatch).to.be.true;
        });

        it('should not allow duplicate usernames', async () => {
            await createTestUser();
            try {
                await createTestUser();
                expect.fail('Should have thrown an error for duplicate username');
            } catch (err) {
                expect(err.message).to.include('duplicate key');
            }
        });

        it('should set timestamps when creating a new user', async () => {
            const before = new Date();
            const result = await createTestUser({ username: 'timestampuser' });
            const after = new Date();

            expect(result.createdAt).to.exist;
            expect(result.updatedAt).to.exist;
            expect(result.createdAt!.getTime()).to.be.at.least(before.getTime());
            expect(result.createdAt!.getTime()).to.be.at.most(after.getTime());
            expect(result.updatedAt!.getTime()).to.equal(result.createdAt!.getTime());
        });

        it('should update the updatedAt timestamp when modifying a user', async () => {
            const user = await createTestUser({ username: 'updateuser' });
            
            // Wait a small amount to ensure timestamp difference
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const before = new Date();
            user.password = 'newpassword';
            await user.save();
            const after = new Date();

            const updatedUser = await UserModel.findById(user._id);
            expect(updatedUser).to.exist;
            expect(updatedUser!.updatedAt).to.exist;
            expect(updatedUser!.createdAt).to.exist;
            
            const updatedAt = updatedUser!.updatedAt!.getTime();
            const createdAt = updatedUser!.createdAt!.getTime();
            
            expect(updatedAt).to.be.above(createdAt);
            expect(updatedAt).to.be.at.least(before.getTime());
            expect(updatedAt).to.be.at.most(after.getTime());
        });
    });

    describe('retrieveUser', () => {
        it('should retrieve a user with correct username', async () => {
            const user = await createTestUser();

            const foundUser = await retrieveUser('testuser');
            expect(foundUser).to.have.property('username', 'testuser');
            expect(foundUser?.organization.toString()).to.equal(testOrgId.toString());
            expect(foundUser?.role).to.equal(testRole);
            const isMatch = await bcrypt.compare('testpassword', foundUser?.password || '');
            expect(isMatch).to.be.true;
        });

        it('should return null for non-existent user', async () => {
            const foundUser = await retrieveUser('nonexistent');
            expect(foundUser).to.be.null;
        });
    });
});
