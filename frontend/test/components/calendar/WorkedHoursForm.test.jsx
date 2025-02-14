import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkedHoursForm from '../../../src/components/calendar/WorkedHoursForm';

describe('WorkedHoursForm Component', () => {
    const mockHandleSubmit = vi.fn(e => e.preventDefault());
    const mockOnClose = vi.fn();
    const defaultProps = {
        handleSubmit: mockHandleSubmit,
        onClose: mockOnClose,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Initial Rendering', () => {
        it('renders all form elements with default values', () => {
            render(<WorkedHoursForm {...defaultProps} />);

            expect(screen.getByLabelText(/project:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/worked hours:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/description:/i)).toBeInTheDocument();

            // Check radio group (overtime) via fieldset
            const overtimeFieldset = screen.getByRole('group', { name: /overtime/i });
            expect(overtimeFieldset).toBeInTheDocument();

            // Check default values
            expect(screen.getByLabelText(/project:/i)).toHaveValue('project1');
            expect(screen.getByLabelText(/worked hours:/i)).toHaveValue(1);
            expect(screen.getByLabelText(/description:/i)).toHaveValue('');

            // Check default overtime selection ("No")
            expect(screen.getByLabelText(/no/i)).toBeChecked();
        });

        it('renders all projects in the dropdown', () => {
            render(<WorkedHoursForm {...defaultProps} />);

            const projectSelect = screen.getByLabelText(/project:/i);
            const options = Array.from(projectSelect.options);

            expect(options).toHaveLength(4);
            expect(options[0].text).toBe('Project 1');
            expect(options[1].text).toBe('Project 2');
            expect(options[2].text).toBe('Project 3');
            expect(options[3].text).toBe('Ultra super duper big long large project name');
        });

        it('renders with custom default values', () => {
            const customProps = {
                ...defaultProps,
                defaultProject: 'project2',
                defaultHours: 5,
                defaultDescription: 'Test description',
                defaultOvertime: true,
            };

            render(<WorkedHoursForm {...customProps} />);

            expect(screen.getByLabelText(/project:/i)).toHaveValue('project2');
            expect(screen.getByLabelText(/worked hours:/i)).toHaveValue(5);
            expect(screen.getByLabelText(/description:/i)).toHaveValue('Test description');

            // Update for radio button (explicitly target "Yes")
            const overtimeYesRadio = screen.getByLabelText(/yes/i);
            expect(overtimeYesRadio).toBeChecked();
        });
    });

    describe('Form Interactions', () => {
        it('updates project selection when changed', async () => {
            render(<WorkedHoursForm {...defaultProps} />);
            const select = screen.getByLabelText(/project:/i);

            await userEvent.selectOptions(select, 'project2');
            expect(select).toHaveValue('project2');
        });

        it('updates worked hours when changed', async () => {
            render(<WorkedHoursForm {...defaultProps} />);
            const input = screen.getByLabelText(/worked hours:/i);

            await userEvent.clear(input);
            await userEvent.type(input, '8');
            expect(input).toHaveValue(8);
        });

        it('updates description when changed', async () => {
            render(<WorkedHoursForm {...defaultProps} />);
            const textarea = screen.getByLabelText(/description:/i);

            await userEvent.type(textarea, 'New description');
            expect(textarea).toHaveValue('New description');
        });

        it('toggles overtime when radio buttons are clicked', async () => {
            render(<WorkedHoursForm {...defaultProps} />);
            const overtimeFieldset = screen.getByRole('group', { name: /overtime/i });
            const yesRadio = within(overtimeFieldset).getByLabelText(/yes/i);
            const noRadio = within(overtimeFieldset).getByLabelText(/no/i);

            await userEvent.click(yesRadio);
            expect(yesRadio).toBeChecked();
            expect(noRadio).not.toBeChecked();

            await userEvent.click(noRadio);
            expect(noRadio).toBeChecked();
            expect(yesRadio).not.toBeChecked();
        });
    });

    describe('Form Submission and Cancellation', () => {
        it('calls handleSubmit when form is submitted', async () => {
            render(<WorkedHoursForm {...defaultProps} />);
            const submitButton = screen.getByRole('button', { name: /submit/i });

            await userEvent.click(submitButton);
            expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
        });

        it('calls onClose when cancel button is clicked', async () => {
            render(<WorkedHoursForm {...defaultProps} />);
            const cancelButton = screen.getByRole('button', { name: /cancel/i });

            await userEvent.click(cancelButton);
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    describe('Input Validation', () => {
        it('restricts worked hours input to between 1 and 24', () => {
            render(<WorkedHoursForm {...defaultProps} />);
            const hoursInput = screen.getByLabelText(/worked hours:/i);

            expect(hoursInput).toHaveAttribute('min', '1');
            expect(hoursInput).toHaveAttribute('max', '24');
        });

        it('maintains type="number" for worked hours input', () => {
            render(<WorkedHoursForm {...defaultProps} />);
            const hoursInput = screen.getByLabelText(/worked hours:/i);

            expect(hoursInput).toHaveAttribute('type', 'number');
        });
    });
});
