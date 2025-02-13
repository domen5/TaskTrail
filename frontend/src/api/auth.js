import { BACKEND_URL } from '../utils/config';

const loginApiCall = async (username, password) => {
    if (!username || !password || !username.trim() || !password.trim()) {
        throw new Error('Username and password are required');
    }
    const url = `${BACKEND_URL}/api/user/login`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'username': username, 'password': password }),
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to login');
    }

    const data = await response.json();
    return data;
};

const verifyTokenApiCall = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/user/verify`, {
            credentials: 'include',
        });
        if (!response.ok) {
            return { isAuthenticated: false };
        }
        const data = await response.json();
        return { isAuthenticated: true, ...data };
    } catch (error) {
        console.error('Error verifying token:', error);
        return { isAuthenticated: false };
    }
};

const logoutApiCall = async () => {
    const url = `${BACKEND_URL}/api/user/logout`;
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to logout');
    }
};

const refreshTokenApiCall = async () => {
    const url = `${BACKEND_URL}/api/user/refresh-token`;
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return data;
};

export { loginApiCall, verifyTokenApiCall, logoutApiCall, refreshTokenApiCall };
