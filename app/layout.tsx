import { type ReactElement, Suspense } from 'react'; // Import necessary React components and types
import './globals.css'; // Import global CSS styles
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton component for loading state
import { CheckConnection, getAlertLowBattery } from '@/lib/api.server'; // Import function to check API connection
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"; // Import Alert components for displaying status
import path from 'path'; // Import path module for handling file paths
import dotenv from "dotenv"; // Import dotenv to load environment variables
import logger from '@/lib/docs/logger'; // Import custom logger

dotenv.config(); // Load environment variables from .env file

// Metadata for the application
export const metadata = {
    title: 'IoT Dashboard',
    description: 'IoT Dashboard for monitoring devices',
};

// Function to get API status
export async function getApiStatus() {
    "use server"; // Ensure it runs only on the server

    try {
        const now = new Date(); // Get current date and time
        const response = await CheckConnection(); // Fetch API status
        logger.debug(`API Status: ${JSON.stringify(response)}`); // Log API status
        const newStatus = {
            LastChecked: now,
            Api: response,
        };

        return newStatus; // Return new status
    } catch (error) {
        // Log error and return default error status
        logger.logWithErrorHandling('Error fetching API status:', error);
        return { Api: { Result: { Status: 'ERROR', Uptime: 'Unknown', Version: 'Unknown' } } };
    }
}

// Root layout component
export default async function RootLayout({ children }: { children: ReactElement }) {
    "use server"; // Ensure it runs only on the server

    // Dynamically import fs.promises inside the function
    const { readFile } = await import('fs/promises');

    // Read package.json file to get the app version
    const packageJsonPath = path.resolve('.', 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    const appVersion = packageJson.version; // Get app version from package.json

    const apiStatus = await getApiStatus(); // Get API status

    const getAlert = await getAlertLowBattery(); // Get alert status

    logger.debug(`API Status 2: ${JSON.stringify(apiStatus)}`); // Log API status

    return (
        <html lang="fr">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <body>
                <Suspense fallback={<Skeleton />}> {/* Display Skeleton component while loading */}
                    <Alert className="fixed top-0 left-1/2 transform -translate-x-1/2 m-4 p-4 h-42 w-112 bg-white shadow-lg rounded-lg flex items-center space-x-4 scale-75 md:scale-100">
                        <div className="relative">
                            {/* Display status indicator based on API status */}
                            <div className={`w-4 h-4 absolute top-0 left-0 rounded-full ${apiStatus.Api.Result.Status === 'OK' ? 'bg-green-500' : apiStatus.Api.Result.Status === 'WARN' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                        </div>
                        <div className="ml-6">
                            <AlertTitle className="font-bold">API Status: {apiStatus.Api.Result.Status}</AlertTitle>
                            <AlertDescription className=" text-gray-600">
                                {/* Display API and app status details */}
                                <a href={`${process.env.API_BASE_URL}/docs`} className="underline">API Endpoint Docs</a>
                                Temps de fonctionnement de l'API : {(parseFloat(apiStatus.Api.Result.Uptime) / 60).toFixed(2)} minutes<br />
                                Version de l'API : {apiStatus.Api.Result.Version}<br />
                                Version de l'application : {appVersion}<br />
                                Temps de fonctionnement de l'application : {`${(process.uptime() / 60).toFixed(2)} minutes`}<br />
                                <a href={`${process.env.API_BASE_URL}/api/alerts/LowBattery`} className="underline">Alert : {getAlert.Results.length}</a>
                            </AlertDescription>
                        </div>
                    </Alert>
                    {children} {/* Render child components */}
                </Suspense>
            </body>
        </html>
    );
}
