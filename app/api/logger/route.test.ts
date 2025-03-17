import { POST } from './route'; // Adjust this path to your actual route file
import logger from '../../../lib/docs/logger';
import { NextRequest } from 'next/server';

// Mock the logger module
jest.mock('../../../lib/docs/logger', () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    logWithErrorHandling: jest.fn(),
}));

// Declare mockJson before using it
const mockJson = jest.fn();

jest.mock('next/server', () => ({
    NextResponse: {
        json: (...args: any) => mockJson(...args),
    },
}));

describe('POST /api/logger', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should log info message and return 201 status', async () => {
        const requestObj = {
            json: async () => ({ type: 'info', message: 'Info message' }),
        } as unknown as NextRequest;

        await POST(requestObj);

        expect(logger.info).toHaveBeenCalledWith('Request body: {"type":"info","message":"Info message"}');
        expect(logger.info).toHaveBeenCalledWith('Info message');
        expect(mockJson).toHaveBeenCalledWith(
            { message: 'Successfully logged' },
            { status: 201 }
        );
    });

    it('should log warn message and return 201 status', async () => {
        const requestObj = {
            json: async () => ({ type: 'warn', message: 'Warn message' }),
        } as unknown as NextRequest;

        await POST(requestObj);

        expect(logger.info).toHaveBeenCalledWith('Request body: {"type":"warn","message":"Warn message"}');
        expect(logger.warn).toHaveBeenCalledWith('Warn message');
        expect(mockJson).toHaveBeenCalledWith(
            { message: 'Successfully logged' },
            { status: 201 }
        );
    });

    it('should log error message and return 201 status', async () => {
        const requestObj = {
            json: async () => ({ type: 'error', message: 'Error message' }),
        } as unknown as NextRequest;

        await POST(requestObj);

        expect(logger.info).toHaveBeenCalledWith('Request body: {"type":"error","message":"Error message"}');
        expect(logger.logWithErrorHandling).toHaveBeenCalledWith('client: ', 'Error message');
        expect(mockJson).toHaveBeenCalledWith(
            { message: 'Successfully logged' },
            { status: 201 }
        );
    });

    it('should log unknow type message and return 201 status', async () => {
        const requestObj = {
            json: async () => ({ type: 'yes', message: 'Error message' }),
        } as unknown as NextRequest;

        await POST(requestObj);

        expect(logger.info).toHaveBeenCalledWith('Request body: {"type":"yes","message":"Error message"}');
        expect(logger.debug).toHaveBeenCalledWith('Unhandled log type: yes, message: Error message');
        expect(mockJson).toHaveBeenCalledWith(
            { message: 'Successfully logged' },
            { status: 201 }
        );
    });

    it('should return 400 status for invalid request body', async () => {
        const requestObj = {
            json: async () => ({}),
        } as unknown as NextRequest;

        await POST(requestObj);

        expect(logger.error).toHaveBeenCalledWith('Invalid request body');
        expect(mockJson).toHaveBeenCalledWith(
            { status: 400, message: 'Invalid request body' },
            { status: 400 }
        );
    });

    it('should return 500 status for server error', async () => {
        const requestObj = {
            json: jest.fn().mockRejectedValue(new Error('Server error')),
        } as unknown as NextRequest;

        await POST(requestObj);

        expect(logger.logWithErrorHandling).toHaveBeenCalledWith('client: ', expect.any(Error));
        expect(mockJson).toHaveBeenCalledWith(
            { status: 500, message: 'Server error' },
            { status: 500 }
        );
    });
});
