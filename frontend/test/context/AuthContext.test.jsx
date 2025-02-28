import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../../src/context/AuthContext';
import * as authApi from '../../src/api/auth';

vi.mock('../../src/api/auth', () => ({
    verifyTokenApiCall: vi.fn(),
    logoutApiCall: vi.fn(),
    loginApiCall: vi.fn(),
    refreshTokenApiCall: vi.fn()
}));

const TestComponent = ({ action }) => {
    return (
        <div>
            <AuthContext.Consumer>
                {(authContext) => {
                    if (action && authContext) {
                        action(authContext);
                    }
                    return <button>Test Action</button>;
                }}
            </AuthContext.Consumer>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        authApi.verifyTokenApiCall.mockResolvedValue({ isAuthenticated: false });
        authApi.logoutApiCall.mockResolvedValue({});
        authApi.loginApiCall.mockResolvedValue({});
        authApi.refreshTokenApiCall.mockResolvedValue({});
        
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const renderWithProvider = (ui) => {
        return render(
            <AuthProvider>
                {ui}
            </AuthProvider>
        );
    };

    describe('Initial Authentication Check', () => {
        it('checks authentication status on mount', async () => {
            await act(async () => {
                renderWithProvider(<TestComponent action={() => {}} />);
            });
            
            expect(authApi.verifyTokenApiCall).toHaveBeenCalledTimes(1);
        });

        it('sets isAuthenticated to true when token is valid', async () => {
            authApi.verifyTokenApiCall.mockResolvedValueOnce({ 
                isAuthenticated: true,
                expiresIn: 3600
            });

            let authContext;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(context) => {
                        authContext = context;
                    }} />
                );
            });
            
            expect(authContext.isAuthenticated).toBe(true);
        });

        it('sets isAuthenticated to false when token is invalid', async () => {
            authApi.verifyTokenApiCall.mockResolvedValueOnce({ 
                isAuthenticated: false 
            });

            let authContext;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(context) => {
                        authContext = context;
                    }} />
                );
            });
            
            expect(authContext.isAuthenticated).toBe(false);
        });

        it('sets up refresh timer when token is valid', async () => {
            authApi.verifyTokenApiCall.mockResolvedValueOnce({ 
                isAuthenticated: true,
                expiresIn: 3600
            });

            await act(async () => {
                renderWithProvider(<TestComponent action={() => {}} />);
            });
            
            // Fast-forward time to trigger the refresh timer
            await act(async () => {
                vi.advanceTimersByTime(3600 * 0.8); // 80% of expiry time
            });
            
            expect(authApi.refreshTokenApiCall).toHaveBeenCalledTimes(1);
        });
    });

    describe('Login', () => {
        it('calls loginApiCall with correct credentials', async () => {
            let authContext;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(context) => {
                        authContext = context;
                    }} />
                );
            });
            
            await act(async () => {
                await authContext.login('testuser', 'password123');
            });
            
            expect(authApi.loginApiCall).toHaveBeenCalledWith('testuser', 'password123');
        });

        it('sets isAuthenticated to true on successful login', async () => {
            authApi.loginApiCall.mockResolvedValueOnce({ 
                expiresIn: 3600 
            });

            let authContext;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(context) => {
                        authContext = context;
                    }} />
                );
            });
            
            await act(async () => {
                await authContext.login('testuser', 'password123');
            });
            
            expect(authContext.isAuthenticated).toBe(true);
        });

        it('sets up refresh timer on successful login', async () => {
            authApi.loginApiCall.mockResolvedValueOnce({ 
                expiresIn: 3600 
            });

            let authContext;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(context) => {
                        authContext = context;
                    }} />
                );
            });
            
            await act(async () => {
                await authContext.login('testuser', 'password123');
            });
            
            // Fast-forward time to trigger the refresh timer
            await act(async () => {
                vi.advanceTimersByTime(3600 * 0.8); // 80% of expiry time
            });
            
            expect(authApi.refreshTokenApiCall).toHaveBeenCalledTimes(1);
        });

        it('throws error on failed login', async () => {
            authApi.loginApiCall.mockRejectedValueOnce(new Error('Failed to login'));

            let authContext;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(context) => {
                        authContext = context;
                    }} />
                );
            });
            
            await expect(authContext.login('testuser', 'wrongpassword')).rejects.toThrow('Failed to login');
            expect(authContext.isAuthenticated).toBe(false);
        });
    });

    describe('Logout', () => {
        it('calls logoutApiCall on logout', async () => {
            let authContext;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(context) => {
                        authContext = context;
                    }} />
                );
            });
            
            await act(async () => {
                await authContext.logout();
            });
            
            expect(authApi.logoutApiCall).toHaveBeenCalledTimes(1);
        });

        it('sets isAuthenticated to false on successful logout', async () => {
            // First set authenticated to true
            authApi.verifyTokenApiCall.mockResolvedValueOnce({ 
                isAuthenticated: true,
                expiresIn: 3600
            });

            let authContext;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(context) => {
                        authContext = context;
                    }} />
                );
            });
            
            expect(authContext.isAuthenticated).toBe(true);
            
            await act(async () => {
                await authContext.logout();
            });
            
            expect(authContext.isAuthenticated).toBe(false);
        });

        it('clears refresh timer on logout', async () => {
            // First set authenticated to true
            authApi.verifyTokenApiCall.mockResolvedValueOnce({ 
                isAuthenticated: true,
                expiresIn: 3600
            });

            let authContext;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(context) => {
                        authContext = context;
                    }} />
                );
            });
            
            await act(async () => {
                await authContext.logout();
            });
            
            // Fast-forward time to when the refresh would have happened
            await act(async () => {
                vi.advanceTimersByTime(3600 * 0.8); // 80% of expiry time
            });
            
            // Refresh should not be called after logout
            expect(authApi.refreshTokenApiCall).not.toHaveBeenCalled();
        });

        it('sets isAuthenticated to false even if logout API call fails', async () => {
            // First set authenticated to true
            authApi.verifyTokenApiCall.mockResolvedValueOnce({ 
                isAuthenticated: true,
                expiresIn: 3600
            });
            
            // Make logout fail
            authApi.logoutApiCall.mockRejectedValueOnce(new Error('Failed to logout'));

            let authContext;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(context) => {
                        authContext = context;
                    }} />
                );
            });
            
            expect(authContext.isAuthenticated).toBe(true);
            
            await act(async () => {
                await authContext.logout();
            });
            
            // Should still be logged out even if API call fails
            expect(authContext.isAuthenticated).toBe(false);
        });
    });

    describe('Token Refresh', () => {
        it('refreshes token before expiration', async () => {
            authApi.verifyTokenApiCall.mockResolvedValueOnce({ 
                isAuthenticated: true,
                expiresIn: 3600
            });

            await act(async () => {
                renderWithProvider(<TestComponent action={() => {}} />);
            });
            
            // Fast-forward time to trigger the refresh timer
            await act(async () => {
                vi.advanceTimersByTime(3600 * 0.8); // 80% of expiry time
            });
            
            expect(authApi.refreshTokenApiCall).toHaveBeenCalledTimes(1);
        });

        it('sets up a new refresh timer after successful token refresh', async () => {
            authApi.verifyTokenApiCall.mockResolvedValueOnce({ 
                isAuthenticated: true,
                expiresIn: 3600
            });
            
            authApi.refreshTokenApiCall.mockResolvedValueOnce({ 
                expiresIn: 3600 
            });

            await act(async () => {
                renderWithProvider(<TestComponent action={() => {}} />);
            });
            
            await act(async () => {
                vi.advanceTimersByTime(3600 * 0.8); 
            });
            
            expect(authApi.refreshTokenApiCall).toHaveBeenCalledTimes(1);
            
            // Reset the mock to check if it's called again
            authApi.refreshTokenApiCall.mockClear();
            
            await act(async () => {
                vi.advanceTimersByTime(3600 * 0.8); 
            });
            
            expect(authApi.refreshTokenApiCall).toHaveBeenCalledTimes(1);
        });

        it('logs out user when token refresh fails', async () => {
            authApi.verifyTokenApiCall.mockResolvedValueOnce({ 
                isAuthenticated: true,
                expiresIn: 3600
            });
            
            authApi.refreshTokenApiCall.mockRejectedValueOnce(new Error('Failed to refresh token'));

            let authContext;
            await act(async () => {
                renderWithProvider(
                    <TestComponent action={(context) => {
                        authContext = context;
                    }} />
                );
            });
            
            expect(authContext.isAuthenticated).toBe(true);
            
            await act(async () => {
                vi.advanceTimersByTime(3600 * 0.8); 
            });
            
            expect(authApi.logoutApiCall).toHaveBeenCalledTimes(1);
            expect(authContext.isAuthenticated).toBe(false);
        });
    });
}); 