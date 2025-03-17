import { searchReleverCapteur, CheckConnection } from './api.server';
import { ReleverCapteurSearchParams } from './model';
import logger from './docs/logger';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

jest.mock('./docs/logger', () => ({
    debug: jest.fn(),
    logWithErrorHandling: jest.fn(),
}));

describe('API Server Tests', () => {
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    describe('searchReleverCapteur', () => {
        it('should return an empty array if no params are provided', async () => {
            const params: ReleverCapteurSearchParams = {};
            fetchMock.mockResponseOnce(JSON.stringify([]));
            
            const result = await searchReleverCapteur(params);
            expect(result).toEqual([]);
            expect(logger.debug).toHaveBeenCalledWith('No params provided, returning empty array');
        });

        it('should convert LastTimePeriod to TimeStart', async () => {
            const params: ReleverCapteurSearchParams = { LastTimePeriod: '1d' };
            const expectedTimeStart = new Date();
            expectedTimeStart.setDate(expectedTimeStart.getDate() - 1);

            fetchMock.mockResponse(JSON.stringify([]));

            await searchReleverCapteur(params);
            expect(params).toHaveProperty('TimeStart', expectedTimeStart.toISOString());
            expect(params).not.toHaveProperty('LastTimePeriod');
        });

        it('should throw an error for invalid time period unit', async () => {
            const params: ReleverCapteurSearchParams = { LastTimePeriod: '1x' };
            await expect(searchReleverCapteur(params)).rejects.toThrow('Invalid time period unit');
        });

        it('should make an API request with correct query string', async () => {
            const params: ReleverCapteurSearchParams = { TimeStart: '2023-01-01T00:00:00.000Z' };
            const query = new URLSearchParams(params as Record<string, string>).toString();

            fetchMock.mockResponseOnce(JSON.stringify([]));

            await searchReleverCapteur(params);

            expect(fetchMock).toHaveBeenCalledWith(
                `${API_BASE_URL}/api/relevercapteurs/search?${query}`, 
                { headers: { 'Content-Type': 'application/json' } }
            );
        });

        it('should log an error if the API request fails', async () => {
            const params: ReleverCapteurSearchParams = { TimeStart: '2023-01-01T00:00:00.000Z' };

            fetchMock.mockResponseOnce(JSON.stringify({}), { status: 500 });

            await searchReleverCapteur(params);

            expect(logger.logWithErrorHandling).toHaveBeenCalledWith('searchReleverCapteur:', expect.any(Error));
        });
    });

    describe('CheckConnection', () => {
        it('should return status true if the connection is successful', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({}));

            const result = await CheckConnection();
            expect(result.status).toBe(true);
        });

        it('should return status false if the connection fails', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({}), { status: 500 });

            const result = await CheckConnection();
            expect(result.status).toBe(false);
            expect(logger.logWithErrorHandling).toHaveBeenCalledWith('CheckConnection:', expect.any(Error));
        });

        it('should log an error if there is an exception', async () => {
            fetchMock.mockReject(new Error('Network error'));

            const result = await CheckConnection();
            expect(result.status).toBe(false);
            expect(result.error).toBeDefined();
            expect(logger.logWithErrorHandling).toHaveBeenCalledWith('Error checking connection:', expect.any(Error));
        });
    });
});