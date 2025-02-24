import { describe, it, expect, vi } from 'vitest';
import { loginApiCall, verifyTokenApiCall, logoutApiCall, refreshTokenApiCall } from '../../src/api/auth';

describe('Auth API Module', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('loginApiCall', () => {
        it('should login successfully with valid credentials', async () => {
            const mockResponse = { 
                success: true, 
                user: { username: 'testuser' } 
            };
            mockFetchSuccess(mockResponse);

            const data = await loginApiCall('testuser', 'password123');
            expect(data).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/user/login'),
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        username: 'testuser', 
                        password: 'password123' 
                    }),
                    credentials: 'include'
                })
            );
        });

        it('should throw error for empty username', async () => {
            await expect(loginApiCall('', 'password123'))
                .rejects.toThrow('Username and password are required');
        });

        it('should throw error for empty password', async () => {
            await expect(loginApiCall('testuser', ''))
                .rejects.toThrow('Username and password are required');
        });

        it('should throw error for failed login', async () => {
            mockFetchError(401, 'Unauthorized');
            await expect(loginApiCall('testuser', 'wrongpassword'))
                .rejects.toThrow('Failed to login');
        });
    });

    describe('verifyTokenApiCall', () => {
        it('should return authenticated status when token is valid', async () => {
            const mockResponse = { 
                username: 'testuser',
                role: 'user'
            };
            mockFetchSuccess(mockResponse);

            const result = await verifyTokenApiCall();
            expect(result).toEqual({
                isAuthenticated: true,
                ...mockResponse
            });
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/user/verify'),
                expect.objectContaining({
                    credentials: 'include'
                })
            );
        });

        it('should return not authenticated when token verification fails', async () => {
            mockFetchError(401);
            const result = await verifyTokenApiCall();
            expect(result).toEqual({ isAuthenticated: false });
        });

        it('should handle network errors gracefully', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));
            const result = await verifyTokenApiCall();
            expect(result).toEqual({ isAuthenticated: false });
        });
    });

    describe('logoutApiCall', () => {
        it('should logout successfully', async () => {
            mockFetchSuccess({ success: true });

            await logoutApiCall();
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/user/logout'),
                expect.objectContaining({
                    method: 'POST',
                    credentials: 'include'
                })
            );
        });

        it('should throw error for failed logout', async () => {
            mockFetchError(500);
            await expect(logoutApiCall())
                .rejects.toThrow('Failed to logout');
        });
    });

    describe('refreshTokenApiCall', () => {
        it('should refresh token successfully', async () => {
            const mockResponse = { 
                success: true,
                newToken: 'new-token-value'
            };
            mockFetchSuccess(mockResponse);

            const result = await refreshTokenApiCall();
            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/user/refresh-token'),
                expect.objectContaining({
                    method: 'POST',
                    credentials: 'include'
                })
            );
        });

        it('should throw error for failed token refresh', async () => {
            mockFetchError(401);
            await expect(refreshTokenApiCall())
                .rejects.toThrow('Failed to refresh token');
        });
    });
}); 