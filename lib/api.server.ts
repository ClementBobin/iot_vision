"use server"; // Indicates that this code is intended to run on the server side

import {
    ReleverCapteurSearchParams, // Importing the type definition for search parameters
} from './model';
import logger from './docs/logger'; // Importing a custom logger for logging messages
import dotenv from 'dotenv'; // Importing dotenv to load environment variables from a .env file

dotenv.config(); // Load environment variables from .env file

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'; // Base URL for the API, defaulting to localhost

// Function to search ReleverCapteur based on provided parameters
export const searchReleverCapteur = async (params: ReleverCapteurSearchParams): Promise<any> => {
    try {
        logger.debug(`Searching ReleverCapteur with params: ${JSON.stringify(params)}`); // Log the search parameters

        // If no parameters are provided, return an empty array
        if (Object.keys(params).length === 0) {
            logger.debug('No params provided, returning empty array');
            return [];
        }

        // If LastTimePeriod is provided, convert it to a start time
        if (params.LastTimePeriod) {
            const timePeriod = params.LastTimePeriod; // Get the time period string
            const unit = timePeriod.slice(-1); // Get the unit (d, m, y)
            const value = parseInt(timePeriod.slice(0, -1), 10); // Get the numeric value
            let timeStart = new Date(); // Initialize the start time as the current date

            // Adjust the start time based on the unit
            switch (unit) {
            case 'd':
                timeStart.setDate(timeStart.getDate() - value);
                break;
            case 'm':
                timeStart.setMonth(timeStart.getMonth() - value);
                break;
            case 'y':
                timeStart.setFullYear(timeStart.getFullYear() - value);
                break;
            default:
                throw new Error('Invalid time period unit'); // Throw an error for invalid units
            }

            params.TimeStart = timeStart.toISOString(); // Set the start time in ISO format
            delete params.LastTimePeriod; // Remove the LastTimePeriod parameter
        }

        // Convert the parameters to a query string
        const query = new URLSearchParams(params as Record<string, string>).toString();
        logger.debug(`Query API: ${query}`); // Log the query string
        logger.debug(`URL API: ${API_BASE_URL}/api/relevercapteurs/search?${query}`); // Log the full API URL

        // Make the API request
        const res = await fetch(`${API_BASE_URL}/api/relevercapteurs/search?${query}`, {
            headers: { 'Content-Type': 'application/json' }, // Set the request headers
        });

        // Check if the response is not OK
        if (!res.ok) logger.logWithErrorHandling('searchReleverCapteur:', Error('Failed to search ReleverCapteur'));

        // Parse the response JSON
        const response = await res.json();
        logger.debug(`ReleverCapteur: ${JSON.stringify(response)}`); // Log the response
        return response; // Return the response
    } catch (error) {
        logger.logWithErrorHandling('Error fetching ReleverCapteur:', error); // Log any errors
        throw error; // Rethrow the error
    }
};

// Function to check the connection to the API
export const CheckConnection = async (): Promise<any> => {
    try {
        logger.debug(`Checking connection to API at: ${API_BASE_URL}`); // Log the API base URL

        // Make the API request to the health endpoint
        const res = await fetch(`${API_BASE_URL}/health`, {
            headers: { 'Content-Type': 'application/json' }, // Set the request headers
        });

        // Check if the response is not OK
        if (!res.ok) {
            logger.logWithErrorHandling('CheckConnection:', Error('Failed to check connection to API'));
            return { status: false }; // Return a status of false
        }

        // Parse the response JSON
        const response = await res.json();
        logger.debug(`Connection status: ${JSON.stringify(response)}`); // Log the response
        return { status: true, ...response }; // Return the status and response
    } catch (error) {
        logger.logWithErrorHandling('Error checking connection:', error); // Log any errors
        return { status: false, error: error }; // Return a status of false and the error
    }
}