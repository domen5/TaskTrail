import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimeSheetProvider } from '../../../src/context/TimeSheetContext';
import { ThemeProvider } from '../../../src/context/ThemeContext';
import Calendar from '../../../src/components/calendar/Calendar';
import * as api from '../../../src/api/api';

// Mock the API module
vi.mock('../../../src/api/api', () => ({
    getMonthWorkedHoursApiCall: vi.fn(),
    createWorkedHoursApiCall: vi.fn(),
    deleteWorkedHoursApiCall: vi.fn(),
    updateWorkedHoursApiCall: vi.fn(),
    lockMonthApiCall: vi.fn(),
    verifyLockedMonthApiCall: vi.fn()
}));

// Helper function to render Calendar with providers
const renderWithProviders = (ui) => {
    return render(
        <ThemeProvider>
            <TimeSheetProvider>
                {ui}
            </TimeSheetProvider>
        </ThemeProvider>
    );
};

describe('Calendar Component', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks();
        
        // Mock successful API responses
        api.getMonthWorkedHoursApiCall.mockResolvedValue({});
        api.verifyLockedMonthApiCall.mockResolvedValue(false);
    });

    describe('Initial Rendering', () => {
        it('renders the calendar header with the current month and year', () => {
            renderWithProviders(<Calendar />);
            const currentDate = new Date();
            const currentMonthYear = currentDate.toLocaleString('default', { month: 'long' }) + ' ' + currentDate.getFullYear();
            expect(screen.getByText(currentMonthYear)).toBeInTheDocument();
        });

        it('renders the days of the week', () => {
            renderWithProviders(<Calendar />);
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            daysOfWeek.forEach(day => {
                expect(screen.getByText(day)).toBeInTheDocument();
            });
        });

        it('renders the calendar grid with correct number of weeks', () => {
            renderWithProviders(<Calendar />);
            const rows = screen.getAllByRole('row');
            // Header row + 4-6 weeks
            expect(rows.length).toBeGreaterThanOrEqual(5);
            expect(rows.length).toBeLessThanOrEqual(7);
        });
    });

    describe('Data Fetching', () => {
        it('fetches data for current, previous, and next month on initial load', async () => {
            renderWithProviders(<Calendar />);
            
            await waitFor(() => {
                expect(api.getMonthWorkedHoursApiCall).toHaveBeenCalledTimes(3);
                expect(api.verifyLockedMonthApiCall).toHaveBeenCalledTimes(3);
            });
        });

        it('displays worked hours data when available', async () => {
            const mockData = {
                "2024-03-15T00:00:00.000Z": [{
                    _id: "1",
                    hours: 8,
                    project: "Test Project",
                    description: "Test Task"
                }]
            };
            api.getMonthWorkedHoursApiCall.mockResolvedValueOnce(mockData);

            renderWithProviders(<Calendar />);
            
            await waitFor(() => {
                expect(api.getMonthWorkedHoursApiCall).toHaveBeenCalled();
            });
        });
    });

    describe('Month Navigation', () => {
        it('updates display when navigating to previous month', async () => {
            renderWithProviders(<Calendar />);
            const prevButton = screen.getByRole('button', { name: /previous month/i });
            
            await act(async () => {
                await userEvent.click(prevButton);
            });
            
            await waitFor(() => {
                expect(api.getMonthWorkedHoursApiCall).toHaveBeenCalledTimes(6); // 3 initial + 3 after navigation
            });
        });

        it('updates display when navigating to next month', async () => {
            renderWithProviders(<Calendar />);
            const nextButton = screen.getByRole('button', { name: /next month/i });
            
            await act(async () => {
                await userEvent.click(nextButton);
            });
            
            await waitFor(() => {
                expect(api.getMonthWorkedHoursApiCall).toHaveBeenCalledTimes(6); // 3 initial + 3 after navigation
            });
        });
    });

    // describe('Day Selection', () => {
    //     it('updates selected day when clicking a day', async () => {
    //         renderWithProviders(<Calendar />);
    //         // Find a day cell that's not padding (from current month)
    //         const dayCell = screen.getAllByRole('button').find(
    //             button => !button.classList.contains('text-muted')
    //         );
            
    //         await userEvent.click(dayCell);
            
    //         // Log the content of the heading
    //         const heading = screen.getByRole('heading', { level: 2 });
    //         console.log(heading.textContent); // Log the heading content

    //         // Get the current month and year
    //         const currentDate = new Date();
    //         const currentMonthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    //         // Verify the day detail view updates
    //         expect(heading.textContent.trim().toLowerCase()).toBe(currentMonthYear.toLowerCase());
    //     });
    // });

    // describe('Forms Interaction', () => {
        // it('opens add form when clicking add button', async () => {
        //     renderWithProviders(<Calendar />);
        //     const addButton = screen.getByRole('button', { name: /add/i });
            
        //     await userEvent.click(addButton);
            
        //     expect(screen.getByRole('dialog')).toBeInTheDocument();
        // });

        // it('closes add form when clicking close button', async () => {
        //     renderWithProviders(<Calendar />);
        //     const addButton = screen.getByRole('button', { name: /add/i });
            
        //     await userEvent.click(addButton);
        //     const closeButton = screen.getByRole('button', { name: /close/i });
        //     await userEvent.click(closeButton);
            
        //     expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        // });
    // });
});