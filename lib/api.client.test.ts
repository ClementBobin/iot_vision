import { ClientLogger } from './api.client';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe('ClientLogger', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('should log info messages', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

        const response = await ClientLogger.info('Test info message');

        expect(response.ok).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith('/api/logger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'info', message: 'Test info message' }),
        });
    });

    it('should log warn messages', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

        const response = await ClientLogger.warn('Test warn message');

        expect(response.ok).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith('/api/logger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'warn', message: 'Test warn message' }),
        });
    });

    it('should log error messages', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

        const response = await ClientLogger.error('Test error message');

        expect(response.ok).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith('/api/logger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'error', message: 'Test error message' }),
        });
    });

    it('should log debug messages', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

        const response = await ClientLogger.debug('Test debug message');

        expect(response.ok).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith('/api/logger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'debug', message: 'Test debug message' }),
        });
    });

    it('should log messages with error handling', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

        const error = new Error('Test error');
        const response = await ClientLogger.logWithErrorHandling('Test message', error);

        expect(response.ok).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith('/api/logger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'error', message: `Test message Test error` }),
        });
    });
});