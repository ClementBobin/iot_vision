// Define a logger object with various logging methods
export const ClientLogger = {
    // Info log method
    info: async (message: string) => {
        // Send a POST request to the logger API with the log type and message
        const response = await fetch('/api/logger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'info', message }),
        });
        return response; // Return the response from the API
    },
    // Warn log method
    warn: async (message: string) => {
        // Send a POST request to the logger API with the log type and message
        const response = await fetch('/api/logger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'warn', message }),
        });
        return response; // Return the response from the API
    },
    // Error log method
    error: async (message: string) => {
        // Send a POST request to the logger API with the log type and message
        const response = await fetch('/api/logger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'error', message }),
        });
        return response; // Return the response from the API
    },
    // Debug log method
    debug: async (message: string) => {
        // Send a POST request to the logger API with the log type and message
        const response = await fetch('/api/logger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'debug', message }),
        });
        return response; // Return the response from the API
    },
    // Log method with error handling
    logWithErrorHandling: async (message: string, error: Error) => {
        // Send a POST request to the logger API with the log type, message, and error message
        const response = await fetch('/api/logger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'error', message: `${message} ${error.message}` }),
        });
        return response; // Return the response from the API
    }
};