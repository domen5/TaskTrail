import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../src/context/ThemeContext';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => {
            store[key] = value.toString();
        }),
        clear: vi.fn(() => {
            store = {};
        })
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

const TestComponent = () => {
    const { isDarkMode, setIsDarkMode } = useTheme();
    return (
        <div data-testid="theme-test">
            <span data-testid="theme-value">{isDarkMode ? 'dark' : 'light'}</span>
            <button 
                data-testid="theme-toggle" 
                onClick={() => setIsDarkMode(!isDarkMode)}
            >
                Toggle Theme
            </button>
        </div>
    );
};

describe('ThemeContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.clear();
        document.body.classList.remove('dark-mode');
    });

    describe('Initial Theme', () => {
        it('defaults to light theme when localStorage is empty', () => {
            const { getByTestId } = render(
                <ThemeProvider>
                    <TestComponent />
                </ThemeProvider>
            );
            
            expect(getByTestId('theme-value').textContent).toBe('light');
            expect(document.body.classList.contains('dark-mode')).toBe(false);
        });

        it('uses dark theme when localStorage has dark theme', () => {
            localStorageMock.getItem.mockReturnValueOnce('dark');
            
            const { getByTestId } = render(
                <ThemeProvider>
                    <TestComponent />
                </ThemeProvider>
            );
            
            expect(getByTestId('theme-value').textContent).toBe('dark');
            expect(document.body.classList.contains('dark-mode')).toBe(true);
        });

        it('uses light theme when localStorage has light theme', () => {
            localStorageMock.getItem.mockReturnValueOnce('light');
            
            const { getByTestId } = render(
                <ThemeProvider>
                    <TestComponent />
                </ThemeProvider>
            );
            
            expect(getByTestId('theme-value').textContent).toBe('light');
            expect(document.body.classList.contains('dark-mode')).toBe(false);
        });
    });

    describe('Theme Toggling', () => {
        it('toggles from light to dark theme', async () => {
            const { getByTestId } = render(
                <ThemeProvider>
                    <TestComponent />
                </ThemeProvider>
            );
            
            // Initially light
            expect(getByTestId('theme-value').textContent).toBe('light');
            
            // Toggle to dark
            await act(async () => {
                getByTestId('theme-toggle').click();
            });
            
            expect(getByTestId('theme-value').textContent).toBe('dark');
            expect(document.body.classList.contains('dark-mode')).toBe(true);
            expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
        });

        it('toggles from dark to light theme', async () => {
            localStorageMock.getItem.mockReturnValueOnce('dark');
            
            const { getByTestId } = render(
                <ThemeProvider>
                    <TestComponent />
                </ThemeProvider>
            );
            
            // Initially dark
            expect(getByTestId('theme-value').textContent).toBe('dark');
            
            // Toggle to light
            await act(async () => {
                getByTestId('theme-toggle').click();
            });
            
            expect(getByTestId('theme-value').textContent).toBe('light');
            expect(document.body.classList.contains('dark-mode')).toBe(false);
            expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
        });
    });

    describe('useTheme Hook', () => {
        it('throws error when used outside ThemeProvider', () => {
            // Suppress console.error for this test
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            expect(() => render(<TestComponent />)).toThrow();
            
            consoleError.mockRestore();
        });
    });

    describe('DOM Updates', () => {
        it('adds dark-mode class to body when theme is dark', () => {
            localStorageMock.getItem.mockReturnValueOnce('dark');
            
            render(
                <ThemeProvider>
                    <TestComponent />
                </ThemeProvider>
            );
            
            expect(document.body.classList.contains('dark-mode')).toBe(true);
        });

        it('removes dark-mode class from body when theme changes to light', async () => {
            localStorageMock.getItem.mockReturnValueOnce('dark');
            
            const { getByTestId } = render(
                <ThemeProvider>
                    <TestComponent />
                </ThemeProvider>
            );
            
            // Initially dark
            expect(document.body.classList.contains('dark-mode')).toBe(true);
            
            // Toggle to light
            await act(async () => {
                getByTestId('theme-toggle').click();
            });
            
            expect(document.body.classList.contains('dark-mode')).toBe(false);
        });
    });

    describe('localStorage Persistence', () => {
        it('saves theme preference to localStorage when changed', async () => {
            const { getByTestId } = render(
                <ThemeProvider>
                    <TestComponent />
                </ThemeProvider>
            );
            
            // Toggle theme
            await act(async () => {
                getByTestId('theme-toggle').click();
            });
            
            expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
            
            // Toggle back
            await act(async () => {
                getByTestId('theme-toggle').click();
            });
            
            expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
        });
    });
});
