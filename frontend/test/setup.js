import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = vi.fn();

// Helper to mock successful responses
global.mockFetchSuccess = (data) => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => data,
    });
};

// Helper to mock failed responses
global.mockFetchError = (status = 500, statusText = 'Internal Server Error') => {
    global.fetch.mockResolvedValueOnce({
        ok: false,
        status,
        statusText,
    });
};

// Clear all mocks after each test
afterEach(() => {
    vi.clearAllMocks();
});
