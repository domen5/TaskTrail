import 'mocha';
import { expect } from 'chai';
import { setupTestDB, teardownTestDB, clearDatabase } from '../setup';
import { createProject, getProject, getUserProjects, updateProject, deleteProject } from '../../src/db/projectStore';
import { InputError } from '../../src/utils/errors';
import { Types } from 'mongoose';

describe('Project Store Tests', () => {
    before(async () => {
        await setupTestDB();
    });

    after(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    describe('createProject', () => {
        const validTestProject = {
            name: 'Test Project',
            organization: new Types.ObjectId(),
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        it('should create a new project', async () => {
            const result = await createProject(validTestProject);
            expect(result).to.exist;
            expect(result.name).to.equal(validTestProject.name);
            expect(result.organization).to.equal(validTestProject.organization);
            expect(result.active).to.equal(validTestProject.active);
        });
        
        it('should throw an error if the project name is empty', async () => {
            try {
                await createProject({ ...validTestProject, name: '' });
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err).to.be.instanceOf(InputError);
            }
        });
    });
})