const BACKEND_URL = window.ENV?.BACKEND_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export { BACKEND_URL };
