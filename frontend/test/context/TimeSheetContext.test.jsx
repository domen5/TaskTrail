import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { TimeSheetProvider, useTimeSheet } from '../../src/context/TimeSheetContext';
import * as api from '../../src/api/api';

vi.mock('../../src/api/api', () => ({
    getMonthWorkedHoursApiCall: vi.fn(),
    createWorkedHoursApiCall: vi.fn(),
    deleteWorkedHoursApiCall: vi.fn(),
    updateWorkedHoursApiCall: vi.fn(),
    lockMonthApiCall: vi.fn(),
    verifyLockedMonthApiCall: vi.fn()
}));

const TestComponent = ({ action }) => {
    const timeSheet = useTimeSheet();
    return (
        <div>
            <button onClick={action(timeSheet)}>Test Action</button>
        </div>
    );
};

describe('TimeSheetContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock the API calls to return resolved promises by default
        api.getMonthWorkedHoursApiCall.mockResolvedValue({});
        api.createWorkedHoursApiCall.mockResolvedValue({});
        api.deleteWorkedHoursApiCall.mockResolvedValue({});
        api.updateWorkedHoursApiCall.mockResolvedValue({});
        api.lockMonthApiCall.mockResolvedValue({});
        api.verifyLockedMonthApiCall.mockResolvedValue(false);
    });

    const renderWithProvider = (ui) => {
        return render(
            <TimeSheetProvider>
                {ui}
            </TimeSheetProvider>
        );
    };

    describe('Context Provider', () => {
        it('throws error when useTimeSheet is used outside provider', () => {
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            expect(() => render(<TestComponent action={() => {}} />))
                .toThrow('useTimeSheet must be used within a TimeSheetProvider');
            
            consoleError.mockRestore();
        });
    });

    describe('getMonthData', () => {
        it('fetches and processes month data correctly', async () => {
            const mockApiResponse = {
                "2024-03-15T00:00:00.000Z": [{
                    _id: "1",
                    date: "2024-03-15T00:00:00.000Z",
                    hours: 8,
                    project: "Test Project",
                    description: "Test Task"
                }]
            };

            api.getMonthWorkedHoursApiCall.mockResolvedValueOnce(mockApiResponse);

            let timeSheetActions;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(actions) => {
                        timeSheetActions = actions;
                        return () => {};
                    }} />
                );
            });

            let result;
            await act(async () => {
                result = await timeSheetActions.getMonthData(2024, 2); // March (0-based)
            });
            
            expect(api.getMonthWorkedHoursApiCall).toHaveBeenCalledWith(2024, 2);
            expect(Object.keys(result)).toHaveLength(1);
            
            // Verify the data is processed with timestamp keys
            const expectedTimestamp = new Date('2024-03-15').setHours(0, 0, 0, 0);
            expect(result[expectedTimestamp]).toBeDefined();
            expect(result[expectedTimestamp][0].hours).toBe(8);
        });

        it('handles empty month data', async () => {
            api.getMonthWorkedHoursApiCall.mockResolvedValueOnce({});

            let timeSheetActions;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(actions) => {
                        timeSheetActions = actions;
                        return () => {};
                    }} />
                );
            });

            let result;
            await act(async () => {
                result = await timeSheetActions.getMonthData(2024, 2);
            });
            expect(Object.keys(result)).toHaveLength(0);
        });
    });

    describe('updateDayData', () => {
        it('creates new worked hours entry successfully', async () => {
            const newEntry = {
                date: new Date('2024-03-15'),
                hours: 8,
                project: 'Test Project',
                description: 'Test Task'
            };

            const mockResponse = {
                _id: '1',
                date: newEntry.date.toISOString(),
                hours: newEntry.hours,
                project: newEntry.project,
                description: newEntry.description
            };

            api.createWorkedHoursApiCall.mockResolvedValueOnce(mockResponse);

            let timeSheetActions;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(actions) => {
                        timeSheetActions = actions;
                        return () => {};
                    }} />
                );
            });

            await act(async () => {
                await timeSheetActions.updateDayData(newEntry);
            });

            expect(api.createWorkedHoursApiCall).toHaveBeenCalledWith(newEntry);
            const dayData = timeSheetActions.getDayData(new Date('2024-03-15'));
            expect(dayData).toHaveLength(1);
            expect(dayData[0].hours).toBe(8);
            expect(dayData[0]._id).toBe('1');
        });

        it('handles creation error and reverts state', async () => {
            const newEntry = {
                date: new Date('2024-03-15'),
                hours: 8,
                project: 'Test Project',
                description: 'Test Task'
            };

            api.createWorkedHoursApiCall.mockRejectedValueOnce(new Error('API Error'));

            let timeSheetActions;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(actions) => {
                        timeSheetActions = actions;
                        return () => {};
                    }} />
                );
            });

            await act(async () => {
                await expect(timeSheetActions.updateDayData(newEntry)).rejects.toThrow('API Error');
            });
            
            const dayData = timeSheetActions.getDayData(new Date('2024-03-15'));
            expect(dayData).toHaveLength(0);
        });
    });

    describe('deleteWorkedHours', () => {
        it('deletes worked hours entry successfully', async () => {
            // First add some data
            const entry = {
                _id: '1',
                date: new Date('2024-03-15'),
                hours: 8,
                project: 'Test Project'
            };

            let timeSheetActions;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(actions) => {
                        timeSheetActions = actions;
                        return () => {};
                    }} />
                );
            });

            // Manually set some initial state
            api.createWorkedHoursApiCall.mockResolvedValueOnce({
                _id: '1',
                date: entry.date.toISOString(),
                hours: entry.hours,
                project: entry.project
            });
            
            await act(async () => {
                await timeSheetActions.updateDayData(entry);
            });
            
            api.deleteWorkedHoursApiCall.mockResolvedValueOnce({});
            
            await act(async () => {
                await timeSheetActions.deleteWorkedHours('1');
            });
            
            expect(api.deleteWorkedHoursApiCall).toHaveBeenCalledWith('1');
            const dayData = timeSheetActions.getDayData(new Date('2024-03-15'));
            expect(dayData).toHaveLength(0);
        });
    });

    describe('Month Locking', () => {
        it('locks month successfully', async () => {
            api.lockMonthApiCall.mockResolvedValueOnce({ success: true });

            let timeSheetActions;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(actions) => {
                        timeSheetActions = actions;
                        return () => {};
                    }} />
                );
            });

            await act(async () => {
                await timeSheetActions.lockMonth(2024, 2);
            });
            
            expect(api.lockMonthApiCall).toHaveBeenCalledWith(2024, 2, true);
            expect(timeSheetActions.isMonthLocked(2024, 2)).toBe(true);
        });

        it('unlocks month successfully', async () => {
            api.lockMonthApiCall.mockResolvedValueOnce({ success: true });

            let timeSheetActions;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(actions) => {
                        timeSheetActions = actions;
                        return () => {};
                    }} />
                );
            });

            await act(async () => {
                await timeSheetActions.unlockMonth(2024, 2);
            });
            
            expect(api.lockMonthApiCall).toHaveBeenCalledWith(2024, 2, false);
            expect(timeSheetActions.isMonthLocked(2024, 2)).toBe(false);
        });

        it('checks locked status correctly', async () => {
            api.verifyLockedMonthApiCall.mockResolvedValueOnce(true);

            let timeSheetActions;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(actions) => {
                        timeSheetActions = actions;
                        return () => {};
                    }} />
                );
            });

            await act(async () => {
                await timeSheetActions.checkAndSetLockedMonth(2024, 2);
            });
            
            expect(api.verifyLockedMonthApiCall).toHaveBeenCalledWith(2024, 2);
            expect(timeSheetActions.isMonthLocked(2024, 2)).toBe(true);
        });

        it('handles lock failure and reverts state', async () => {
            api.lockMonthApiCall.mockRejectedValueOnce(new Error('Lock failed'));

            let timeSheetActions;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(actions) => {
                        timeSheetActions = actions;
                        return () => {};
                    }} />
                );
            });

            await act(async () => {
                await expect(timeSheetActions.lockMonth(2024, 2)).rejects.toThrow('Lock failed');
            });
            
            expect(timeSheetActions.isMonthLocked(2024, 2)).toBe(false);
        });
    });

    describe('updateWorkedHours', () => {
        it('updates worked hours entry successfully', async () => {
            const entry = {
                _id: '1',
                date: new Date('2024-03-15'),
                hours: 8,
                project: 'Test Project',
                description: 'Original Task'
            };
            
            const updatedEntry = {
                _id: '1',
                date: new Date('2024-03-15'),
                hours: 6,
                project: 'Test Project',
                description: 'Updated Task'
            };

            let timeSheetActions;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(actions) => {
                        timeSheetActions = actions;
                        return () => {};
                    }} />
                );
            });

            // First add the entry
            api.createWorkedHoursApiCall.mockResolvedValueOnce({
                ...entry,
                date: entry.date.toISOString()
            });
            
            await act(async () => {
                await timeSheetActions.updateDayData(entry);
            });
            
            // Then update it
            api.updateWorkedHoursApiCall.mockResolvedValueOnce({
                ...updatedEntry,
                date: updatedEntry.date.toISOString()
            });
            
            await act(async () => {
                await timeSheetActions.updateWorkedHours(updatedEntry);
            });
            
            expect(api.updateWorkedHoursApiCall).toHaveBeenCalledWith(expect.objectContaining({
                _id: '1',
                hours: 6,
                description: 'Updated Task'
            }));
            
            const dayData = timeSheetActions.getDayData(new Date('2024-03-15'));
            expect(dayData).toHaveLength(1);
            expect(dayData[0].hours).toBe(6);
            expect(dayData[0].description).toBe('Updated Task');
        });
    });
}); 