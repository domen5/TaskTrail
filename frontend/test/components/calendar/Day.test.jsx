import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTimeSheet } from '../../../src/context/TimeSheetContext';
import { useTheme } from '../../../src/context/ThemeContext';
import Day from '../../../src/components/calendar/Day';

vi.mock('../../../src/context/TimeSheetContext', () => ({
    useTimeSheet: vi.fn(() => ({
        getDayData: vi.fn().mockImplementation((date) => {
            return [];
        })
    }))
}));

vi.mock('../../../src/context/ThemeContext', () => ({
    useTheme: vi.fn(() => ({
        isDarkMode: false
    }))
}));

const renderWithProviders = (ui, { timeSheetValue = {}, themeValue = {} } = {}) => {
    const mockGetDayData = vi.fn().mockImplementation((date) => {
        return timeSheetValue.dayData || [];
    });
    
    useTimeSheet.mockReturnValue({
        getDayData: mockGetDayData,
        ...timeSheetValue
    });
    
    useTheme.mockReturnValue({
        isDarkMode: false,
        ...themeValue
    });
    
    return render(ui);
};

describe('Day Component', () => {
    const mockDate = new Date(2025, 1, 26);
    const mockSetSelectedDay = vi.fn();
    
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(mockDate);
    });
    
    afterEach(() => {
        vi.useRealTimers();
    });
    
    describe('Rendering', () => {
        it('renders the day number', () => {
            renderWithProviders(
                <Day 
                    date={mockDate} 
                    isPadded={false} 
                    setSelectedDay={mockSetSelectedDay}
                    isMonthLocked={false}
                />
            );
            
            expect(screen.getByText('26')).toBeInTheDocument();
        });
        
        it('applies "text-muted" class when isPadded is true', () => {
            renderWithProviders(
                <Day 
                    date={mockDate} 
                    isPadded={true} 
                    setSelectedDay={mockSetSelectedDay}
                    isMonthLocked={false}
                />
            );
            
            const dayElement = screen.getByText('26').closest('.day');
            expect(dayElement).toHaveClass('text-muted');
        });
        
        it('applies "today" class when date is today', () => {
            const today = new Date();
            vi.setSystemTime(today);
            
            renderWithProviders(
                <Day 
                    date={today} 
                    isPadded={false} 
                    setSelectedDay={mockSetSelectedDay}
                    isMonthLocked={false}
                />
            );
            
            const dayElement = screen.getByText(today.getDate().toString()).closest('.day');
            expect(dayElement).toHaveClass('today');
        });
        
        it('shows lock icon when month is locked', () => {
            renderWithProviders(
                <Day 
                    date={mockDate} 
                    isPadded={false} 
                    setSelectedDay={mockSetSelectedDay}
                    isMonthLocked={true}
                />
            );
            
            // FontAwesome icons are rendered as <i> elements with specific classes
            const lockIcon = document.querySelector('.fas.fa-lock');
            expect(lockIcon).toBeInTheDocument();
        });
    });
    
    describe('Day Entries', () => {
        const mockEntries = [
            { hours: 4, project: 'Project A', description: 'Task 1' },
            { hours: 2, project: 'Project B', description: 'Task 2', overtime: true }
        ];
        
        it('displays total hours when entries exist', () => {
            renderWithProviders(
                <Day 
                    date={mockDate} 
                    isPadded={false} 
                    setSelectedDay={mockSetSelectedDay}
                    isMonthLocked={false}
                />,
                { 
                    timeSheetValue: { 
                        dayData: mockEntries 
                    } 
                }
            );
            
            expect(screen.getByText('6h')).toBeInTheDocument();
        });
        
        it('renders each entry with correct project and hours', () => {
            renderWithProviders(
                <Day 
                    date={mockDate} 
                    isPadded={false} 
                    setSelectedDay={mockSetSelectedDay}
                    isMonthLocked={false}
                />,
                { 
                    timeSheetValue: { 
                        dayData: mockEntries 
                    } 
                }
            );
            
            expect(screen.getByText('Project A')).toBeInTheDocument();
            expect(screen.getByText('4h')).toBeInTheDocument();
            expect(screen.getByText('Project B')).toBeInTheDocument();
            expect(screen.getByText('2h')).toBeInTheDocument();
        });
        
        it('renders entry descriptions', () => {
            renderWithProviders(
                <Day 
                    date={mockDate} 
                    isPadded={false} 
                    setSelectedDay={mockSetSelectedDay}
                    isMonthLocked={false}
                />,
                { 
                    timeSheetValue: { 
                        dayData: mockEntries 
                    } 
                }
            );
            
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Task 2')).toBeInTheDocument();
        });
        
        it('applies overtime styling to overtime entries', () => {
            renderWithProviders(
                <Day 
                    date={mockDate} 
                    isPadded={false} 
                    setSelectedDay={mockSetSelectedDay}
                    isMonthLocked={false}
                />,
                { 
                    timeSheetValue: { 
                        dayData: mockEntries 
                    } 
                }
            );
            
            // Find the entry containers by their project text
            const regularEntryContainer = screen.getByText('Project A').closest('div[class*="border-start"]');
            const overtimeEntryContainer = screen.getByText('Project B').closest('div[class*="border-start"]');
            
            expect(regularEntryContainer.className).toContain('border-success');
            expect(overtimeEntryContainer.className).toContain('border-danger');
        });
        
        it('shows "N/A" when project is not provided', () => {
            const entriesWithoutProject = [
                { hours: 3, description: 'No project task' }
            ];
            
            renderWithProviders(
                <Day 
                    date={mockDate} 
                    isPadded={false} 
                    setSelectedDay={mockSetSelectedDay}
                    isMonthLocked={false}
                />,
                { 
                    timeSheetValue: { 
                        dayData: entriesWithoutProject 
                    } 
                }
            );
            
            expect(screen.getByText('N/A')).toBeInTheDocument();
        });
        
        it('shows "No description" when description is not provided', () => {
            const entriesWithoutDescription = [
                { hours: 3, project: 'Project C' }
            ];
            
            renderWithProviders(
                <Day 
                    date={mockDate} 
                    isPadded={false} 
                    setSelectedDay={mockSetSelectedDay}
                    isMonthLocked={false}
                />,
                { 
                    timeSheetValue: { 
                        dayData: entriesWithoutDescription 
                    } 
                }
            );
            
            expect(screen.getByText('No description')).toBeInTheDocument();
        });
    });
    
    describe('Interactions', () => {
        it('calls setSelectedDay with the date when clicked', () => {
            renderWithProviders(
                <Day 
                    date={mockDate} 
                    isPadded={false} 
                    setSelectedDay={mockSetSelectedDay}
                    isMonthLocked={false}
                />
            );
            
            const dayElement = screen.getByText('26').closest('.day');
            fireEvent.click(dayElement);
            
            expect(mockSetSelectedDay).toHaveBeenCalledTimes(1);
            expect(mockSetSelectedDay).toHaveBeenCalledWith(mockDate);
        });
    });
    
    describe('Dark Mode', () => {
        it('applies dark mode styling when dark mode is enabled', () => {
            renderWithProviders(
                <Day 
                    date={mockDate} 
                    isPadded={false} 
                    setSelectedDay={mockSetSelectedDay}
                    isMonthLocked={false}
                />,
                {
                    themeValue: {
                        isDarkMode: true
                    }
                }
            );
            
            const dayElement = screen.getByText('26').closest('.day');
            expect(dayElement.className).toContain('bg-dark');
            expect(dayElement.className).toContain('text-light');
        });
    });
}); 