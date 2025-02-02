import { BACKEND_URL } from '../utils/config';

const login = async (username, password) => {
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

export { login };