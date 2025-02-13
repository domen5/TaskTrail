import 'mocha';
import { expect } from 'chai';
import { Types } from 'mongoose';
import { createOrganization, getOrganizationById, getOrganizationByName } from '../../src/db/organizationStore';
import { OrganizationModel } from '../../src/models/Organization';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';

describe('OrganizationStore Tests', () => {
    before(async () => {
        await setupTestDB();
    });

    after(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    describe('createOrganization', () => {
        it('should create a new organization', async () => {
            const orgData = { name: 'Test Organization' };
            const organization = await createOrganization(orgData);

            expect(organization).to.exist;
            expect(organization.name).to.equal(orgData.name);
            expect(organization._id).to.exist;

            const savedOrg = await OrganizationModel.findById(organization._id);
            expect(savedOrg).to.exist;
            expect(savedOrg?.name).to.equal(orgData.name);
        });

        it('should set timestamps when creating a new organization', async () => {
            const before = new Date();
            const organization = await createOrganization({ name: 'Test Organization' });
            const after = new Date();

            expect(organization.createdAt).to.exist;
            expect(organization.updatedAt).to.exist;
            expect(organization.createdAt!.getTime()).to.be.at.least(before.getTime());
            expect(organization.createdAt!.getTime()).to.be.at.most(after.getTime());
            expect(organization.updatedAt!.getTime()).to.equal(organization.createdAt!.getTime());
        });

        it('should throw error when name is missing', async () => {
            try {
                await createOrganization({} as any);
                expect.fail('Should have thrown an error');
            } catch (err: any) {
                expect(err.name).to.equal('ValidationError');
            }
        });

        it('should not allow duplicate organization names', async () => {
            await createOrganization({ name: 'Test Organization' });
            
            try {
                await createOrganization({ name: 'Test Organization' });
                expect.fail('Should have thrown an error');
            } catch (err: any) {
                expect(err.code).to.equal(11000); // MongoDB duplicate key error code
            }
        });
    });

    describe('getOrganizationById', () => {
        it('should retrieve an organization by id', async () => {
            const created = await createOrganization({ name: 'Test Organization' });
            const found = await getOrganizationById(created._id);

            expect(found).to.exist;
            expect(found?.name).to.equal(created.name);
            expect(found?._id.toString()).to.equal(created._id.toString());
        });

        it('should return null for non-existent id', async () => {
            const nonExistentId = new Types.ObjectId();
            const found = await getOrganizationById(nonExistentId);
            expect(found).to.be.null;
        });

        it('should throw error for invalid id format', async () => {
            try {
                await getOrganizationById('invalid-id' as any);
                expect.fail('Should have thrown an error');
            } catch (err: any) {
                expect(err).to.exist;
            }
        });
    });

    describe('getOrganizationByName', () => {
        it('should retrieve an organization by name', async () => {
            const created = await createOrganization({ name: 'Test Organization' });
            const found = await getOrganizationByName(created.name);

            expect(found).to.exist;
            expect(found?.name).to.equal(created.name);
            expect(found?._id.toString()).to.equal(created._id.toString());
        });

        it('should return null for non-existent name', async () => {
            const found = await getOrganizationByName('Non Existent Organization');
            expect(found).to.be.null;
        });

        it('should be case sensitive when searching by name', async () => {
            await createOrganization({ name: 'Test Organization' });
            const found = await getOrganizationByName('test organization');
            expect(found).to.be.null;
        });
    });
});
