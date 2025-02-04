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
};

const verifyTokenApiCall = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/user/verify`, {
            credentials: 'include',
        });
        return response.ok;
    } catch (error) {
        console.error('Error verifying token:', error);
        return false;
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

export { loginApiCall, verifyTokenApiCall, logoutApiCall };
