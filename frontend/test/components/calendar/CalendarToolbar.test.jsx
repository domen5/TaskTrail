import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimeSheetProvider } from '../../../src/context/TimeSheetContext';
import { ThemeProvider } from '../../../src/context/ThemeContext';
import CalendarToolbar from '../../../src/components/calendar/CalendarToolbar';
import * as api from '../../../src/api/api';
import React from 'react';

// Mock the API module
vi.mock('../../../src/api/api', () => ({
    getMonthWorkedHoursApiCall: vi.fn(),
    lockMonthApiCall: vi.fn(),
    unlockMonthApiCall: vi.fn(),
    verifyLockedMonthApiCall: vi.fn()
}));

// Create mock functions for the TimeSheet context
const mockGetMonthData = vi.fn();
const mockLockMonth = vi.fn();
const mockUnlockMonth = vi.fn();
const mockIsMonthLocked = vi.fn();

// Mock the TimeSheetContext using the recommended approach
vi.mock('../../../src/context/TimeSheetContext', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useTimeSheet: () => ({
            getMonthData: mockGetMonthData,
            lockMonth: mockLockMonth,
            unlockMonth: mockUnlockMonth,
            isMonthLocked: mockIsMonthLocked
        })
    };
});

// Mock URL methods
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Helper function to render CalendarToolbar with providers
const renderWithProviders = (ui) => {
    return render(
        <ThemeProvider>
            <TimeSheetProvider>
                {ui}
            </TimeSheetProvider>
        </ThemeProvider>
    );
};

describe('CalendarToolbar Component', () => {
    const mockSetSelectedDay = vi.fn();
    const mockSelectedDay = new Date(2025, 1, 26); // February 26, 2025
    
    // Setup DOM for tests
    let container;
    
    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks();
        
        // Create a fresh container for each test
        container = document.createElement('div');
        document.body.appendChild(container);
        
        // Default mock implementations for API calls
        api.getMonthWorkedHoursApiCall.mockResolvedValue({});
        api.lockMonthApiCall.mockResolvedValue({ success: true });
        api.unlockMonthApiCall.mockResolvedValue({ success: true });
        api.verifyLockedMonthApiCall.mockResolvedValue(false);
        
        // Default mock implementations for context
        mockGetMonthData.mockResolvedValue({});
        mockLockMonth.mockResolvedValue();
        mockUnlockMonth.mockResolvedValue();
        mockIsMonthLocked.mockReturnValue(false);
    });
    
    afterEach(() => {
        // Clean up container after each test
        if (container) {
            document.body.removeChild(container);
        }
    });

    describe('Month Navigation', () => {
        it('navigates to previous month when clicking previous month button', async () => {
            await act(async () => {
                renderWithProviders(
                    <CalendarToolbar 
                        setSelectedDay={mockSetSelectedDay} 
                        selectedDay={mockSelectedDay} 
                        isMonthLocked={false}
                    />
                );
            });
            
            const prevButton = screen.getByRole('button', { name: /previous month/i });
            await userEvent.click(prevButton);
            
            // Check if setSelectedDay was called with the correct date (previous month)
            expect(mockSetSelectedDay).toHaveBeenCalled();
            const expectedDate = new Date(2025, 0, 26); // January 26, 2025
            const actualDate = mockSetSelectedDay.mock.calls[0][0];
            
            expect(actualDate.getFullYear()).toBe(expectedDate.getFullYear());
            expect(actualDate.getMonth()).toBe(expectedDate.getMonth());
        });

        it('navigates to next month when clicking next month button', async () => {
            await act(async () => {
                renderWithProviders(
                    <CalendarToolbar 
                        setSelectedDay={mockSetSelectedDay} 
                        selectedDay={mockSelectedDay} 
                        isMonthLocked={false}
                    />
                );
            });
            
            const nextButton = screen.getByRole('button', { name: /next month/i });
            await userEvent.click(nextButton);
            
            // Check if setSelectedDay was called with the correct date (next month)
            expect(mockSetSelectedDay).toHaveBeenCalled();
            const expectedDate = new Date(2025, 2, 26); // March 26, 2025
            const actualDate = mockSetSelectedDay.mock.calls[0][0];
            
            expect(actualDate.getFullYear()).toBe(expectedDate.getFullYear());
            expect(actualDate.getMonth()).toBe(expectedDate.getMonth());
        });
    });

    describe('Month Locking', () => {
        it('shows lock icon and "Lock Month" text when month is unlocked', async () => {
            mockIsMonthLocked.mockReturnValue(false);
            
            await act(async () => {
                renderWithProviders(
                    <CalendarToolbar 
                        setSelectedDay={mockSetSelectedDay} 
                        selectedDay={mockSelectedDay} 
                        isMonthLocked={false}
                    />
                );
            });
            
            const lockButton = screen.getByRole('button', { name: /lock month/i });
            expect(lockButton).toBeInTheDocument();
            expect(lockButton).toHaveTextContent('Lock Month');
        });

        it('shows unlock icon and "Unlock Month" text when month is locked', async () => {
            mockIsMonthLocked.mockReturnValue(true);
            
            await act(async () => {
                renderWithProviders(
                    <CalendarToolbar 
                        setSelectedDay={mockSetSelectedDay} 
                        selectedDay={mockSelectedDay} 
                        isMonthLocked={true}
                    />
                );
            });
            
            const unlockButton = screen.getByRole('button', { name: /unlock month/i });
            expect(unlockButton).toBeInTheDocument();
            expect(unlockButton).toHaveTextContent('Unlock Month');
        });

        it('calls lockMonth when clicking Lock Month button', async () => {
            mockIsMonthLocked.mockReturnValue(false);
            
            await act(async () => {
                renderWithProviders(
                    <CalendarToolbar 
                        setSelectedDay={mockSetSelectedDay} 
                        selectedDay={mockSelectedDay} 
                        isMonthLocked={false}
                    />
                );
            });
            
            const lockButton = screen.getByRole('button', { name: /lock month/i });
            await userEvent.click(lockButton);
            
            expect(mockLockMonth).toHaveBeenCalledWith(2025, 1);
        });

        it('calls unlockMonth when clicking Unlock Month button', async () => {
            mockIsMonthLocked.mockReturnValue(true);
            
            await act(async () => {
                renderWithProviders(
                    <CalendarToolbar 
                        setSelectedDay={mockSetSelectedDay} 
                        selectedDay={mockSelectedDay} 
                        isMonthLocked={true}
                    />
                );
            });
            
            const unlockButton = screen.getByRole('button', { name: /unlock month/i });
            await userEvent.click(unlockButton);
            
            expect(mockUnlockMonth).toHaveBeenCalledWith(2025, 1);
        });
    });

    describe('Export Functionality', () => {
        it('shows export button', async () => {
            await act(async () => {
                renderWithProviders(
                    <CalendarToolbar 
                        setSelectedDay={mockSetSelectedDay} 
                        selectedDay={mockSelectedDay} 
                        isMonthLocked={false}
                    />
                );
            });
            
            const exportButton = screen.getByRole('button', { name: /export monthly report/i });
            expect(exportButton).toBeInTheDocument();
        });

        it('calls getMonthData and creates download link when clicking export button', async () => {
            // Mock document.createElement and other DOM methods
            const mockLink = {
                href: '',
                setAttribute: vi.fn(),
                style: {},
                click: vi.fn()
            };
            
            const originalCreateElement = document.createElement;
            document.createElement = vi.fn((tag) => {
                if (tag === 'a') return mockLink;
                return originalCreateElement.call(document, tag);
            });
            
            const originalAppendChild = document.body.appendChild;
            document.body.appendChild = vi.fn((node) => {
                if (node === mockLink) return node;
                return originalAppendChild.call(document.body, node);
            });
            
            const originalRemoveChild = document.body.removeChild;
            document.body.removeChild = vi.fn((node) => {
                if (node === mockLink) return node;
                return originalRemoveChild.call(document.body, node);
            });
            
            // Mock month data
            mockGetMonthData.mockResolvedValue({
                "2025-02-26T00:00:00.000Z": [
                    { _id: "1", hours: 8, project: "Test Project", description: "Test Task" }
                ]
            });
            
            await act(async () => {
                renderWithProviders(
                    <CalendarToolbar 
                        setSelectedDay={mockSetSelectedDay} 
                        selectedDay={mockSelectedDay} 
                        isMonthLocked={false}
                    />
                );
            });
            
            const exportButton = screen.getByRole('button', { name: /export monthly report/i });
            await userEvent.click(exportButton);
            
            await waitFor(() => {
                expect(mockGetMonthData).toHaveBeenCalledWith(2025, 1);
                expect(document.createElement).toHaveBeenCalledWith('a');
                expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'report_2025_2.csv');
                expect(mockLink.click).toHaveBeenCalled();
            });
            
            // Restore original methods
            document.createElement = originalCreateElement;
            document.body.appendChild = originalAppendChild;
            document.body.removeChild = originalRemoveChild;
        });

        it('shows alert when no data is available for export', async () => {
            // Mock window.alert
            const originalAlert = window.alert;
            window.alert = vi.fn();
            
            mockGetMonthData.mockResolvedValue({});
            
            await act(async () => {
                renderWithProviders(
                    <CalendarToolbar 
                        setSelectedDay={mockSetSelectedDay} 
                        selectedDay={mockSelectedDay} 
                        isMonthLocked={false}
                    />
                );
            });
            
            const exportButton = screen.getByRole('button', { name: /export monthly report/i });
            await userEvent.click(exportButton);
            
            await waitFor(() => {
                expect(mockGetMonthData).toHaveBeenCalledWith(2025, 1);
                expect(window.alert).toHaveBeenCalledWith('No data available for selected month.');
            });
            
            window.alert = originalAlert;
        });
    });
}); 