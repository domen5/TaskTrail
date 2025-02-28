import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTimeSheet } from '../../../src/context/TimeSheetContext';
import { useTheme } from '../../../src/context/ThemeContext';
import DayDetail from '../../../src/components/calendar/DayDetail';

// Mock the TimeSheetContext
vi.mock('../../../src/context/TimeSheetContext', () => ({
    useTimeSheet: vi.fn(() => ({
        getDayData: vi.fn().mockImplementation((date) => {
            // Default implementation returns empty array
            return [];
        }),
        deleteWorkedHours: vi.fn().mockResolvedValue(true)
    }))
}));

// Mock the ThemeContext
vi.mock('../../../src/context/ThemeContext', () => ({
    useTheme: vi.fn(() => ({
        isDarkMode: false
    }))
}));

// Helper function to render DayDetail with providers
const renderWithProviders = (ui, { timeSheetValue = {}, themeValue = {} } = {}) => {
    // Override default mocks with provided values
    const mockGetDayData = vi.fn().mockImplementation((date) => {
        return timeSheetValue.dayData || [];
    });
    
    const mockDeleteWorkedHours = vi.fn().mockResolvedValue(true);
    
    useTimeSheet.mockReturnValue({
        getDayData: mockGetDayData,
        deleteWorkedHours: mockDeleteWorkedHours,
        ...timeSheetValue
    });
    
    useTheme.mockReturnValue({
        isDarkMode: false,
        ...themeValue
    });
    
    return render(ui);
};

describe('DayDetail Component', () => {
    const mockDate = new Date(2025, 1, 26); // February 26, 2025
    const mockHandleClickEditForm = vi.fn();
    const mockHandleClickAddForm = vi.fn();
    
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(mockDate);
    });
    
    afterEach(() => {
        vi.useRealTimers();
    });
    
    describe('Rendering', () => {
        it('renders the date in the header', () => {
            renderWithProviders(
                <DayDetail 
                    date={mockDate} 
                    handleClickEditForm={mockHandleClickEditForm}
                    handleClickAddForm={mockHandleClickAddForm}
                    isMonthLocked={false}
                />
            );
            
            // Format date as it would appear in the component
            const formattedDate = mockDate.toLocaleDateString();
            expect(screen.getByText(formattedDate)).toBeInTheDocument();
        });
        
        it('renders the add button', () => {
            renderWithProviders(
                <DayDetail 
                    date={mockDate} 
                    handleClickEditForm={mockHandleClickEditForm}
                    handleClickAddForm={mockHandleClickAddForm}
                    isMonthLocked={false}
                />
            );
            
            const addButton = document.querySelector('.fa-plus').closest('button');
            expect(addButton).toBeInTheDocument();
            expect(addButton).not.toBeDisabled();
        });
        
        it('disables the add button when month is locked', () => {
            renderWithProviders(
                <DayDetail 
                    date={mockDate} 
                    handleClickEditForm={mockHandleClickEditForm}
                    handleClickAddForm={mockHandleClickAddForm}
                    isMonthLocked={true}
                />
            );
            
            const addButton = document.querySelector('.fa-plus').closest('button');
            expect(addButton).toBeDisabled();
        });
        
        it('does not render entries section when no entries exist', () => {
            renderWithProviders(
                <DayDetail 
                    date={mockDate} 
                    handleClickEditForm={mockHandleClickEditForm}
                    handleClickAddForm={mockHandleClickAddForm}
                    isMonthLocked={false}
                />
            );
            
            const totalText = screen.queryByText(/Total:/);
            expect(totalText).not.toBeInTheDocument();
        });
    });
    
    describe('Day Entries', () => {
        const mockEntries = [
            { _id: '1', hours: 4, project: 'Project A', description: 'Task 1' },
            { _id: '2', hours: 2, project: 'Project B', description: 'Task 2', overtime: true }
        ];
        
        it('displays total hours when entries exist', () => {
            renderWithProviders(
                <DayDetail 
                    date={mockDate} 
                    handleClickEditForm={mockHandleClickEditForm}
                    handleClickAddForm={mockHandleClickAddForm}
                    isMonthLocked={false}
                />,
                { 
                    timeSheetValue: { 
                        dayData: mockEntries 
                    } 
                }
            );
            
            expect(screen.getByText('Total: 6h')).toBeInTheDocument();
        });
        
        it('renders each entry with correct project and hours', () => {
            renderWithProviders(
                <DayDetail 
                    date={mockDate} 
                    handleClickEditForm={mockHandleClickEditForm}
                    handleClickAddForm={mockHandleClickAddForm}
                    isMonthLocked={false}
                />,
                { 
                    timeSheetValue: { 
                        dayData: mockEntries 
                    } 
                }
            );
            
            expect(screen.getByText('Project A')).toBeInTheDocument();
            expect(screen.getByText('4h: Task 1')).toBeInTheDocument();
            expect(screen.getByText('Project B')).toBeInTheDocument();
            expect(screen.getByText('2h: Task 2')).toBeInTheDocument();
        });
        
        it('applies overtime styling to overtime entries', () => {
            renderWithProviders(
                <DayDetail 
                    date={mockDate} 
                    handleClickEditForm={mockHandleClickEditForm}
                    handleClickAddForm={mockHandleClickAddForm}
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
            
            // Check that the regular entry has success border and the overtime entry has danger border
            expect(regularEntryContainer.className).toContain('border-success');
            expect(overtimeEntryContainer.className).toContain('border-danger');
        });
        
        it('shows "N/A" when project is not provided', () => {
            const entriesWithoutProject = [
                { _id: '3', hours: 3, description: 'No project task' }
            ];
            
            renderWithProviders(
                <DayDetail 
                    date={mockDate} 
                    handleClickEditForm={mockHandleClickEditForm}
                    handleClickAddForm={mockHandleClickAddForm}
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
                { _id: '4', hours: 3, project: 'Project C' }
            ];
            
            renderWithProviders(
                <DayDetail 
                    date={mockDate} 
                    handleClickEditForm={mockHandleClickEditForm}
                    handleClickAddForm={mockHandleClickAddForm}
                    isMonthLocked={false}
                />,
                { 
                    timeSheetValue: { 
                        dayData: entriesWithoutDescription 
                    } 
                }
            );
            
            expect(screen.getByText('3h: No description')).toBeInTheDocument();
        });
        
        it('disables edit and delete buttons when month is locked', () => {
            renderWithProviders(
                <DayDetail 
                    date={mockDate} 
                    handleClickEditForm={mockHandleClickEditForm}
                    handleClickAddForm={mockHandleClickAddForm}
                    isMonthLocked={true}
                />,
                { 
                    timeSheetValue: { 
                        dayData: mockEntries 
                    } 
                }
            );
            
            const editButtons = document.querySelectorAll('.fa-edit');
            const deleteButtons = document.querySelectorAll('.fa-x');
            
            editButtons.forEach(icon => {
                expect(icon.closest('button')).toBeDisabled();
            });
            
            deleteButtons.forEach(icon => {
                expect(icon.closest('button')).toBeDisabled();
            });
        });
    });
    
    describe('Interactions', () => {
        const mockEntries = [
            { _id: '1', hours: 4, project: 'Project A', description: 'Task 1' },
            { _id: '2', hours: 2, project: 'Project B', description: 'Task 2', overtime: true }
        ];
        
        it('calls handleClickAddForm when add button is clicked', () => {
            renderWithProviders(
                <DayDetail 
                    date={mockDate} 
                    handleClickEditForm={mockHandleClickEditForm}
                    handleClickAddForm={mockHandleClickAddForm}
                    isMonthLocked={false}
                />
            );
            
            const addButton = document.querySelector('.fa-plus').closest('button');
            fireEvent.click(addButton);
            
            expect(mockHandleClickAddForm).toHaveBeenCalledTimes(1);
        });
        
        it('calls handleClickEditForm with entry data when edit button is clicked', () => {
            renderWithProviders(
                <DayDetail 
                    date={mockDate} 
                    handleClickEditForm={mockHandleClickEditForm}
                    handleClickAddForm={mockHandleClickAddForm}
                    isMonthLocked={false}
                />,
                { 
                    timeSheetValue: { 
                        dayData: mockEntries 
                    } 
                }
            );
            
            const editButtons = document.querySelectorAll('.fa-edit');
            fireEvent.click(editButtons[0].closest('button'));
            
            expect(mockHandleClickEditForm).toHaveBeenCalledTimes(1);
            expect(mockHandleClickEditForm).toHaveBeenCalledWith(mockEntries[0]);
        });
        
        it('calls deleteWorkedHours with entry id when delete button is clicked', async () => {
            const mockDeleteWorkedHours = vi.fn().mockResolvedValue(true);
            
            renderWithProviders(
                <DayDetail 
                    date={mockDate} 
                    handleClickEditForm={mockHandleClickEditForm}
                    handleClickAddForm={mockHandleClickAddForm}
                    isMonthLocked={false}
                />,
                { 
                    timeSheetValue: { 
                        dayData: mockEntries,
                        deleteWorkedHours: mockDeleteWorkedHours
                    } 
                }
            );
            
            const deleteButtons = document.querySelectorAll('.fa-x');
            await fireEvent.click(deleteButtons[0].closest('button'));
            
            expect(mockDeleteWorkedHours).toHaveBeenCalledTimes(1);
            expect(mockDeleteWorkedHours).toHaveBeenCalledWith('1');
        });
    });
    
    describe('Dark Mode', () => {
        it('applies dark mode styling when dark mode is enabled', () => {
            renderWithProviders(
                <DayDetail 
                    date={mockDate} 
                    handleClickEditForm={mockHandleClickEditForm}
                    handleClickAddForm={mockHandleClickAddForm}
                    isMonthLocked={false}
                />,
                {
                    themeValue: {
                        isDarkMode: true
                    }
                }
            );
            
            const cardElement = screen.getByText(mockDate.toLocaleDateString()).closest('.card');
            expect(cardElement.className).toContain('bg-dark');
            expect(cardElement.className).toContain('text-light');
        });
        
        it('applies dark mode styling to entries when dark mode is enabled', () => {
            const mockEntries = [
                { _id: '1', hours: 4, project: 'Project A', description: 'Task 1' }
            ];
            
            renderWithProviders(
                <DayDetail 
                    date={mockDate} 
                    handleClickEditForm={mockHandleClickEditForm}
                    handleClickAddForm={mockHandleClickAddForm}
                    isMonthLocked={false}
                />,
                {
                    timeSheetValue: {
                        dayData: mockEntries
                    },
                    themeValue: {
                        isDarkMode: true
                    }
                }
            );
            
            const totalElement = screen.getByText('Total: 4h');
            expect(totalElement.className).toContain('border-secondary');
            
            const descriptionElement = screen.getByText('4h: Task 1');
            expect(descriptionElement.className).toContain('text-light-emphasis');
        });
    });
}); 