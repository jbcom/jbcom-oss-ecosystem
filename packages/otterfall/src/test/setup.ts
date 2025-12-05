import * as matchers from '@testing-library/jest-dom/matchers';
import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test to prevent memory leaks and storage buildup
afterEach(() => {
    cleanup();
    // Clear localStorage between tests to prevent storage buildup
    localStorage.clear();
    sessionStorage.clear();
});
