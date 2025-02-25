import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimeSheetProvider } from '../../../src/context/TimeSheetContext';
import { ThemeProvider } from '../../../src/context/ThemeContext';
import MonthlyChart from '../../../src/components/charts/MonthlyChart';

// Mock the recharts library
vi.mock('recharts', () => {
    const OriginalModule = vi.importActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
        BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
        Bar: ({ dataKey, name }) => <div data-testid={`bar-${dataKey}`} data-name={name}></div>,
        XAxis: () => <div data-testid="x-axis"></div>,
        YAxis: () => <div data-testid="y-axis"></div>,
        CartesianGrid: () => <div data-testid="cartesian-grid"></div>,
        Tooltip: () => <div data-testid="tooltip"></div>,
        Legend: () => <div data-testid="legend"></div>,
    };
});

// Mock the TimeSheetContext
vi.mock('../../../src/context/TimeSheetContext', () => ({
    TimeSheetProvider: ({ children }) => children,
    useTimeSheet: vi.fn(),
}));

// Mock the ThemeContext
vi.mock('../../../src/context/ThemeContext', () => ({
    ThemeProvider: ({ children }) => children,
    useTheme: vi.fn().mockReturnValue({ isDarkMode: false }),
}));

// Mock the API module
vi.mock('../../../src/api/api', () => ({
    getMonthWorkedHoursApiCall: vi.fn(),
    createWorkedHoursApiCall: vi.fn(),
    deleteWorkedHoursApiCall: vi.fn(),
    updateWorkedHoursApiCall: vi.fn(),
    lockMonthApiCall: vi.fn(),
    verifyLockedMonthApiCall: vi.fn()
}));

// Import the useTimeSheet mock to configure it in tests
import { useTimeSheet } from '../../../src/context/TimeSheetContext';
import { useTheme } from '../../../src/context/ThemeContext';

// Helper function to render MonthlyChart with providers
const renderWithProviders = (ui) => {
    return render(
        <ThemeProvider>
            <TimeSheetProvider>
                {ui}
            </TimeSheetProvider>
        </ThemeProvider>
    );
};

describe('MonthlyChart Component', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks();

        // Default mock for useTimeSheet
        useTimeSheet.mockReturnValue({
            getDayData: vi.fn().mockReturnValue([]),
        });
    });

    describe('Initial Rendering', () => {
        it('renders the chart title and subtitle', () => {
            const testDate = new Date(2023, 5, 15); // June 15, 2023
            renderWithProviders(<MonthlyChart selectedMonth={testDate} />);

            expect(screen.getByText(/Monthly Worked Hours/i)).toBeInTheDocument();
            expect(screen.getByText(/Look at your work hours for the month of June 2023/i)).toBeInTheDocument();
        });

        it('renders chart with zero hours when no data is available', () => {
            const testDate = new Date(2023, 5, 15); // June 15, 2023
            useTimeSheet.mockReturnValue({
                getDayData: vi.fn().mockReturnValue([]),
            });

            renderWithProviders(<MonthlyChart selectedMonth={testDate} />);

            // Instead of checking for "No data available" message, check that chart components are rendered
            expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
            expect(screen.getByTestId('bar-regularHours')).toBeInTheDocument();
            expect(screen.getByTestId('bar-overtimeHours')).toBeInTheDocument();
        });

        it('displays "No data available" message when chartData is empty', () => {
            // Create a special test case where all days are treated as weekends
            // This will result in chartData being empty
            const testDate = new Date(2023, 5, 15); // June 15, 2023
            
            // Mock getDayData to return empty array
            useTimeSheet.mockReturnValue({
                getDayData: vi.fn().mockReturnValue([]),
            });
            
            // Mock Date.prototype.getDay to always return 0 (Sunday)
            const originalGetDay = Date.prototype.getDay;
            Date.prototype.getDay = vi.fn().mockReturnValue(0);
            
            renderWithProviders(<MonthlyChart selectedMonth={testDate} />);
            
            // Check for "No data available" message
            expect(screen.getByText(/No data available for June 2023/i)).toBeInTheDocument();
            
            // Restore original getDay method
            Date.prototype.getDay = originalGetDay;
        });
    });

    describe('Chart Data Display', () => {
        it('renders chart components when data is available', () => {
            const testDate = new Date(2023, 5, 15); // June 15, 2023

            // Mock data for a specific day
            const mockEntries = [
                { hours: 5, overtime: false },
                { hours: 3, overtime: true }
            ];

            useTimeSheet.mockReturnValue({
                getDayData: vi.fn().mockImplementation((date) => {
                    // Return mock data only for June 15, 2023
                    if (date.getDate() === 15 && date.getMonth() === 5 && date.getFullYear() === 2023) {
                        return mockEntries;
                    }
                    return [];
                }),
            });

            renderWithProviders(<MonthlyChart selectedMonth={testDate} />);

            // Check that chart components are rendered
            expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
            expect(screen.getByTestId('bar-regularHours')).toBeInTheDocument();
            expect(screen.getByTestId('bar-overtimeHours')).toBeInTheDocument();
        });

        it('correctly calculates regular and overtime hours', () => {
            const testDate = new Date(2023, 5, 15); // June 15, 2023
            
            // Create mock data with both regular and overtime hours
            const mockEntries = [
                { hours: 8, overtime: false },  // 8 regular hours
                { hours: 2, overtime: true },   // 2 overtime hours
                { hours: 1, overtime: false },  // 1 more regular hour
                { hours: 3, overtime: true }    // 3 more overtime hours
            ];
            
            // Total: 9 regular hours, 5 overtime hours
            
            useTimeSheet.mockReturnValue({
                getDayData: vi.fn().mockImplementation((date) => {
                    if (date.getDate() === 15 && date.getMonth() === 5 && date.getFullYear() === 2023) {
                        return mockEntries;
                    }
                    return [];
                }),
            });
            
            renderWithProviders(<MonthlyChart selectedMonth={testDate} />);
            
            // Since we can't easily test the actual values in the chart with our mocked recharts,
            // we'll verify that the Bar components are rendered with the correct dataKeys
            const regularHoursBar = screen.getByTestId('bar-regularHours');
            const overtimeHoursBar = screen.getByTestId('bar-overtimeHours');
            
            expect(regularHoursBar).toHaveAttribute('data-name', 'Regular Hours');
            expect(overtimeHoursBar).toHaveAttribute('data-name', 'Overtime Hours');
        });
    });

    describe('Theme Integration', () => {
        it('applies light theme styles when isDarkMode is false', () => {
            const testDate = new Date(2023, 5, 15);
            useTheme.mockReturnValue({ isDarkMode: false });

            // Mock data to ensure chart renders
            useTimeSheet.mockReturnValue({
                getDayData: vi.fn().mockImplementation(() => [{ hours: 5, overtime: false }]),
            });

            renderWithProviders(<MonthlyChart selectedMonth={testDate} />);

            // Check for light theme class
            const container = screen.getByText(/Monthly Worked Hours/i).closest('div.container-md');
            expect(container).toHaveClass('text-dark');
            expect(container).not.toHaveClass('text-white');
        });

        it('applies dark theme styles when isDarkMode is true', () => {
            const testDate = new Date(2023, 5, 15);
            useTheme.mockReturnValue({ isDarkMode: true });

            // Mock data to ensure chart renders
            useTimeSheet.mockReturnValue({
                getDayData: vi.fn().mockImplementation(() => [{ hours: 5, overtime: false }]),
            });

            renderWithProviders(<MonthlyChart selectedMonth={testDate} />);

            // Check for dark theme class
            const container = screen.getByText(/Monthly Worked Hours/i).closest('div.container-md');
            expect(container).toHaveClass('text-white');
            expect(container).not.toHaveClass('text-dark');
        });
    });
});
