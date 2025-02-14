import { describe, it, expect, vi } from 'vitest';
import {
    getMonthWorkedHoursApiCall,
    createWorkedHoursApiCall,
    deleteWorkedHoursApiCall,
    updateWorkedHoursApiCall,
    lockMonthApiCall,
    verifyLockedMonthApiCall
} from '../../src/api/api';

// Mock the fetch function
global.fetch = vi.fn();

describe('API Module', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('getMonthWorkedHoursApiCall', () => {
        it('should fetch and aggregate month worked hours successfully', async () => {
            const mockResponse = [
                {
                    "_id": "67ae72369b3600f028d59c3c",
                    "user": "67ae7120f2003aa7f6f45f56",
                    "date": "2025-02-13T00:00:00.000Z",
                    "project": "project1",
                    "hours": 4,
                    "description": "Task 1",
                    "overtime": false
                },
                {
                    "_id": "67ae72369b3600f028d59c3d",
                    "user": "67ae7120f2003aa7f6f45f56",
                    "date": "2025-02-13T00:00:00.000Z",
                    "project": "project2",
                    "hours": 4,
                    "description": "Task 2",
                    "overtime": false
                }
            ];
            
            mockFetchSuccess(mockResponse);
            
            const data = await getMonthWorkedHoursApiCall(2025, 1); // Note: Month is 0-based
            expect(data["2025-02-13T00:00:00.000Z"]).toHaveLength(2);
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/worked-hours/2025/2'), 
                expect.objectContaining({ credentials: 'include' }));
        });

        it('should handle fetch error', async () => {
            mockFetchError(500);
            await expect(getMonthWorkedHoursApiCall(2025, 1))
                .rejects.toThrowError('Failed to fetch month data from backend');
        });

        it('should handle invalid response data', async () => {
            mockFetchSuccess({ invalid: 'data' }); // Not an array
            await expect(getMonthWorkedHoursApiCall(2025, 1))
                .rejects.toThrow('Retrieved bad data from backend, expected an array.');
        });
    });

    describe('createWorkedHoursApiCall', () => {
        it('should create worked hours successfully', async () => {
            const mockResponse = { success: true };
            mockFetchSuccess(mockResponse);

            const formData = {
                date: new Date('2025-02-13'),
                hours: 8,
                project: 'project1',
                description: 'Task 1'
            };

            const data = await createWorkedHoursApiCall(formData);
            expect(data).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/worked-hours/2025/2/13'),
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.any(Object),
                    credentials: 'include'
                })
            );
        });

        it('should throw error for invalid date', async () => {
            const formData = { hours: 8 }; // Missing date
            await expect(createWorkedHoursApiCall(formData))
                .rejects.toThrow('Invalid date in formData');
        });
    });

    describe('deleteWorkedHoursApiCall', () => {
        it('should delete worked hours successfully', async () => {
            mockFetchSuccess({ success: true });
            
            await deleteWorkedHoursApiCall('67ae72369b3600f028d59c3c');
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/worked-hours'),
                expect.objectContaining({
                    method: 'DELETE',
                    credentials: 'include'
                })
            );
        });

        it('should throw error for missing id', async () => {
            await expect(deleteWorkedHoursApiCall())
                .rejects.toThrow('Failed deleting workedHours with id: undefined');
        });
    });

    describe('updateWorkedHoursApiCall', () => {
        it('should update worked hours successfully', async () => {
            const mockResponse = { success: true };
            mockFetchSuccess(mockResponse);

            const workedHours = {
                _id: '67ae72369b3600f028d59c3c',
                date: new Date('2025-02-13'),
                hours: 8,
                project: 'project1',
                description: 'Updated Task'
            };

            const data = await updateWorkedHoursApiCall(workedHours);
            expect(data).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/worked-hours'),
                expect.objectContaining({
                    method: 'PUT',
                    credentials: 'include'
                })
            );
        });

        it('should throw error for invalid id', async () => {
            const workedHours = {
                date: new Date(),
                hours: 8
            };
            await expect(updateWorkedHoursApiCall(workedHours))
                .rejects.toThrow('Failed updating workedHours with id: undefined');
        });

        it('should throw error for invalid date', async () => {
            const workedHours = {
                _id: '67ae72369b3600f028d59c3c',
                hours: 8
            };
            await expect(updateWorkedHoursApiCall(workedHours))
                .rejects.toThrow('Failed updating workedHours with id: 67ae72369b3600f028d59c3c');
        });
    });

    describe('lockMonthApiCall', () => {
        it('should lock month successfully', async () => {
            const mockResponse = { success: true };
            mockFetchSuccess(mockResponse);

            const data = await lockMonthApiCall(2025, 1, true);
            expect(data).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/month'),
                expect.objectContaining({
                    method: 'POST',
                    credentials: 'include',
                    body: expect.stringContaining('"isLocked":true')
                })
            );
        });

        it('should throw error for invalid year', async () => {
            await expect(lockMonthApiCall(1999, 1, true))
                .rejects.toThrow('Invalid year');
        });

        it('should throw error for invalid month', async () => {
            await expect(lockMonthApiCall(2025, 12, true))
                .rejects.toThrow('Invalid month');
        });
    });

    describe('verifyLockedMonthApiCall', () => {
        it('should verify locked month successfully', async () => {
            mockFetchSuccess({ isLocked: true });

            const isLocked = await verifyLockedMonthApiCall(2025, 1);
            expect(isLocked).toBe(true);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/lock/2025/2'),
                expect.objectContaining({
                    method: 'GET',
                    credentials: 'include'
                })
            );
        });

        it('should throw error for invalid parameters', async () => {
            await expect(verifyLockedMonthApiCall())
                .rejects.toThrow('Missing required parameters');
        });
    });
});
