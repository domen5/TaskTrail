import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import Login from '../../src/components/Login';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
        useLocation: vi.fn()
    };
});

describe('Login Component', () => {
    const mockLogin = vi.fn().mockResolvedValue({ success: true });
    const mockOnClose = vi.fn();
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        mockLogin.mockResolvedValue({ success: true });
    });

    const renderLoginComponent = (props = {}, locationState = { state: { from: { pathname: '/dashboard' } } }) => {
        useLocation.mockReturnValue(locationState);
        return render(
            <BrowserRouter>
                <AuthContext.Provider value={{ login: mockLogin }}>
                    <Login onClose={mockOnClose} {...props} />
                </AuthContext.Provider>
            </BrowserRouter>
        );
    };

    it('renders login form with all necessary elements', () => {
        renderLoginComponent();

        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByText('Submit')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('submit button should be disabled initially', () => {
        renderLoginComponent();
        expect(screen.getByText('Submit')).toBeDisabled();
    });

    it('enables submit button when username and password are not empty', () => {
        renderLoginComponent();
        const usernameInput = screen.getByLabelText('Username');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Submit');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(submitButton).not.toBeDisabled();
    });

    it('calls onClose when Cancel button is clicked', () => {
        renderLoginComponent();
        fireEvent.click(screen.getByText('Cancel'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('handles successful login submission', async () => {
        renderLoginComponent();
        const usernameInput = screen.getByLabelText('Username');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Submit');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('handles failed login attempt', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockLogin.mockRejectedValueOnce(new Error('Login failed'));
        
        renderLoginComponent();
        const usernameInput = screen.getByLabelText('Username');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Submit');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('testuser', 'wrongpassword');
            expect(consoleErrorSpy).toHaveBeenCalledWith('Login failed:', expect.any(Error));
            expect(mockNavigate).not.toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
    });

    it('navigates to default redirect path when no redirect location is specified', async () => {
        renderLoginComponent({}, { state: null });
        
        const usernameInput = screen.getByLabelText('Username');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Submit');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/home');
        });
    });

    it('respects custom default redirect path', async () => {
        const customPath = '/custom-path';
        renderLoginComponent({ defaultRedirect: customPath }, { state: null });
        
        const usernameInput = screen.getByLabelText('Username');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Submit');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(customPath);
        });
    });

    it('shows password requirements help text', () => {
        renderLoginComponent();
        const helpText = screen.getByText(/Passwords must have at least 8 characters/);
        expect(helpText).toBeInTheDocument();
    });

    it('updates form data when typing', () => {
        renderLoginComponent();
        const usernameInput = screen.getByLabelText('Username');
        const passwordInput = screen.getByLabelText('Password');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(usernameInput.value).toBe('testuser');
        expect(passwordInput.value).toBe('password123');
    });
}); 