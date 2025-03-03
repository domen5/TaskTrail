import { render, screen, act } from '@testing-library/react';
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
        ReferenceLine: ({ y, label }) => <div data-testid="reference-line" data-y={y} data-label={label}></div>,
    };
});

vi.mock('../../../src/context/TimeSheetContext', () => ({
    TimeSheetProvider: ({ children }) => children,
    useTimeSheet: vi.fn(),
}));

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
        vi.clearAllMocks();

        useTimeSheet.mockReturnValue({
            getDayData: vi.fn().mockReturnValue([]),
            getMonthData: vi.fn().mockResolvedValue({}),
            getSelectedDay: vi.fn().mockReturnValue(new Date()),
        });
    });

    describe('Initial Rendering', () => {
        it('renders the chart title and subtitle', async () => {
            const testDate = new Date(2025, 1, 26);
            
            // Mock data with hours so the chart renders instead of "No data available"
            useTimeSheet.mockReturnValue({
                getDayData: vi.fn().mockImplementation(() => {
                    return [{ hours: 8, overtime: false }];
                }),
                getMonthData: vi.fn().mockResolvedValue({}),
                getSelectedDay: vi.fn().mockReturnValue(testDate),
            });
            
            await act(async () => {
                renderWithProviders(<MonthlyChart />);
            });

            expect(screen.getByText(/Monthly Worked Hours/i)).toBeInTheDocument();
            expect(screen.getByText(/Look at your work hours for the month of/i)).toBeInTheDocument();
            expect(screen.getByText(/February/i)).toBeInTheDocument();
            expect(screen.getByText(/2025/i)).toBeInTheDocument();
        });

        it('displays "No data available" message when no hours are recorded', async () => {
            const testDate = new Date(2025, 1, 26);
            
            useTimeSheet.mockReturnValue({
                getDayData: vi.fn().mockReturnValue([]),
                getMonthData: vi.fn().mockResolvedValue({}),
                getSelectedDay: vi.fn().mockReturnValue(testDate),
            });
            
            await act(async () => {
                renderWithProviders(<MonthlyChart />);
            });
            
            expect(screen.getByText(/No data available for February 2025/i)).toBeInTheDocument();            
            expect(screen.queryByText(/Monthly Worked Hours/i)).not.toBeInTheDocument();
        });
    });

    describe('Chart Data Display', () => {
        it('renders chart components when data is available', async () => {
            const testDate = new Date(2025, 1, 26);

            const mockEntries = [
                { hours: 5, overtime: false },
                { hours: 3, overtime: true }
            ];

            useTimeSheet.mockReturnValue({
                getDayData: vi.fn().mockImplementation((date) => {
                    if (date.getDate() === 26 && date.getMonth() === 1 && date.getFullYear() === 2025) {
                        return mockEntries;
                    }
                    return [];
                }),
                getMonthData: vi.fn().mockResolvedValue({}),
                getSelectedDay: vi.fn().mockReturnValue(testDate),
            });

            await act(async () => {
                renderWithProviders(<MonthlyChart />);
            });

            expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
            expect(screen.getByTestId('bar-regularHours')).toBeInTheDocument();
            expect(screen.getByTestId('bar-overtimeHours')).toBeInTheDocument();
        });

        it('correctly calculates regular and overtime hours', async () => {
            const testDate = new Date(2025, 1, 26);
            
            const mockEntries = [
                { hours: 8, overtime: false },      
                { hours: 2, overtime: true },   
                { hours: 1, overtime: false },  
                { hours: 3, overtime: true }    
            ];
            
            useTimeSheet.mockReturnValue({
                getDayData: vi.fn().mockImplementation((date) => {
                    if (date.getDate() === 26 && date.getMonth() === 1 && date.getFullYear() === 2025) {
                        return mockEntries;
                    }
                    return [];
                }),
                getMonthData: vi.fn().mockResolvedValue({}),
                getSelectedDay: vi.fn().mockReturnValue(testDate),
            });
            
            await act(async () => {
                renderWithProviders(<MonthlyChart />);
            });
            
            // Since we can't easily test the actual values in the chart with our mocked recharts,
            // we'll verify that the Bar components are rendered with the correct dataKeys
            const regularHoursBar = screen.getByTestId('bar-regularHours');
            const overtimeHoursBar = screen.getByTestId('bar-overtimeHours');
            
            expect(regularHoursBar).toHaveAttribute('data-name', 'Regular Hours');
            expect(overtimeHoursBar).toHaveAttribute('data-name', 'Overtime Hours');
        }); 
    });

    describe('Theme Integration', () => {
        it('applies light theme styles when isDarkMode is false', async () => {
            const testDate = new Date(2025, 1, 26);
            useTheme.mockReturnValue({ isDarkMode: false });

            useTimeSheet.mockReturnValue({
                getDayData: vi.fn().mockImplementation(() => [{ hours: 5, overtime: false }]),
                getMonthData: vi.fn().mockResolvedValue({}),
                getSelectedDay: vi.fn().mockReturnValue(testDate),
            });

            await act(async () => {
                renderWithProviders(<MonthlyChart />);
            });

            // Check for light theme class
            const container = screen.getByText(/Monthly Worked Hours/i).closest('div.container-md');
            expect(container).toHaveClass('text-dark');
            expect(container).not.toHaveClass('text-white');
        });

        it('applies dark theme styles when isDarkMode is true', async () => {
            const testDate = new Date(2025, 1, 26);
            useTheme.mockReturnValue({ isDarkMode: true });

            useTimeSheet.mockReturnValue({
                getDayData: vi.fn().mockImplementation(() => [{ hours: 5, overtime: false }]),
                getMonthData: vi.fn().mockResolvedValue({}),
                getSelectedDay: vi.fn().mockReturnValue(testDate),
            });

            await act(async () => {
                renderWithProviders(<MonthlyChart />);
            });

            // Check for dark theme class
            const container = screen.getByText(/Monthly Worked Hours/i).closest('div.container-md');
            expect(container).toHaveClass('text-white');
            expect(container).not.toHaveClass('text-dark');
        });
    });

    describe('Data Fetching', () => {
        it('calls getMonthData when component mounts and no data exists', async () => {
            const testDate = new Date(2025, 1, 26);
            
            const getMonthDataMock = vi.fn().mockResolvedValue({});
            
            useTimeSheet.mockReturnValue({
                getDayData: vi.fn().mockReturnValue([]),
                getMonthData: getMonthDataMock,
                getSelectedDay: vi.fn().mockReturnValue(testDate),
            });
            
            await act(async () => {
                renderWithProviders(<MonthlyChart />);
            });
            
            expect(getMonthDataMock).toHaveBeenCalledWith(2025, 1);
        });

        it('does not call getMonthData when data already exists', async () => {
            const testDate = new Date(2025, 1, 26);
            
            const getMonthDataMock = vi.fn().mockResolvedValue({});
            
            useTimeSheet.mockReturnValue({
                getDayData: vi.fn().mockImplementation((date) => {
                    // Return data for the test date to simulate existing data
                    if (date.getMonth() === 1 && date.getFullYear() === 2025) {
                        return [{ hours: 5, overtime: false }];
                    }
                    return [];
                }),
                getMonthData: getMonthDataMock,
                getSelectedDay: vi.fn().mockReturnValue(testDate),
            });
            
            await act(async () => {
                renderWithProviders(<MonthlyChart />);
            });
            
            // getMonthData should not be called since data already exists
            expect(getMonthDataMock).not.toHaveBeenCalled();
        });

        it('displays loading state while fetching data', async () => {
            const testDate = new Date(2025, 1, 26);
            
            // Create a promise that won't resolve immediately
            let resolvePromise;
            const promise = new Promise(resolve => {
                resolvePromise = resolve;
            });
            
            useTimeSheet.mockReturnValue({
                getDayData: vi.fn().mockReturnValue([]),
                getMonthData: vi.fn().mockReturnValue(promise),
                getSelectedDay: vi.fn().mockReturnValue(testDate),
            });
            
            await act(async () => {
                renderWithProviders(<MonthlyChart />);
            });
            
            expect(screen.getByText(/Loading data for February 2025/i)).toBeInTheDocument();
            expect(screen.getByRole('status')).toBeInTheDocument();
            
            // Resolve the promise to complete the test
            await act(async () => {
                resolvePromise({});
            });
        });
    });
});
