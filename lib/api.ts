"use server";

import {
    ReleverCapteurSearchParams,
} from './model';
import logger from './docs/logger';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Search ReleverCapteur
export const searchReleverCapteur = async (params: ReleverCapteurSearchParams): Promise<any> => {
    try {
        logger.debug(`Searching ReleverCapteur with params: ${JSON.stringify(params)}`);
        const query = new URLSearchParams(params as Record<string, string>).toString();
        logger.debug(`Query: ${query}`);
        logger.debug(`URL: ${API_BASE_URL}/api/relevercapteurs/search?${query}`);
        const res = await fetch(`${API_BASE_URL}/api/relevercapteurs/search?${query}`, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) logger.logWithErrorHandling('searchReleverCapteur:', Error('Failed to search ReleverCapteur'));

        const response = await res.json();
        logger.debug(`ReleverCapteur: ${JSON.stringify(response)}`);
        return response;
    } catch (error) {
        logger.logWithErrorHandling('Error fetching ReleverCapteur:', error);
        throw error;
    }
};

export const CheckConnection = async (): Promise<any> => {
    try {
        logger.debug(`Checking connection to API at: ${API_BASE_URL}`);
        const res = await fetch(`${API_BASE_URL}/health`, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) logger.logWithErrorHandling('CheckConnection:', Error('Failed to check connection to API'));

        const response = await res.json();
        logger.debug(`Connection status: ${JSON.stringify(response)}`);
        return true;
    } catch (error) {
        logger.logWithErrorHandling('Error checking connection:', error);
        return false;
    }
}