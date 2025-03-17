import { type ReactElement, Suspense } from 'react';
import './globals.css';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckConnection } from '@/lib/api';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import path from 'path';
import dotenv from "dotenv";

dotenv.config();

export const metadata = {
    title: 'IoT Dashboard',
    description: 'IoT Dashboard for monitoring devices',
};

const CACHE_FILE = path.resolve(process.env.LOG_DIRECTORY || '.', 'apiStatus.json');
const CHECK_INTERVAL = 3600000; // 1 hour in milliseconds

async function getApiStatus() {
    "use server"; // Ensure it runs only on the server

    // Dynamically import fs.promises inside the function
    const { readFile, writeFile } = await import('fs/promises');

    try {
        let cacheData;
        try {
            cacheData = JSON.parse(await readFile(CACHE_FILE, 'utf8'));
        } catch {
            cacheData = { lastChecked: 0, status: null };
        }

        const now = Date.now();

        if (now - cacheData.lastChecked > CHECK_INTERVAL) {
            const response = await CheckConnection(); // Fetch API status
            console.log('API Status:', response);
            const newStatus = {
                lastChecked: now,
                status: response,
            };

            await writeFile(CACHE_FILE, JSON.stringify(newStatus, null, 2));

            return newStatus.status;
        }

        return cacheData.status;
    } catch (error) {
        console.error('Error fetching API status:', error);
        return { Result: { Status: 'ERROR', Uptime: 'Unknown', Version: 'Unknown' } };
    }
}

export default async function RootLayout({ children }: { children: ReactElement }) {
    "use server";

    // Dynamically import fs.promises inside the function
    const { readFile } = await import('fs/promises');
    
    // Read package.json file to get the app version
    const packageJsonPath = path.resolve('.', 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    const appVersion = packageJson.version;

    const apiStatus = await getApiStatus();

    return (
        <html lang="en">
        <body>
        <Suspense fallback={<Skeleton />}>
            <Alert className="fixed top-0 left-0 m-4">
                <div className={`w-4 h-4 rounded-full ${apiStatus.Result.Status === 'OK' ? 'bg-green-500' : apiStatus.Result.Status === 'WARN' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                <AlertTitle>API Status: {apiStatus.Result.Status}</AlertTitle>
                <AlertDescription>
                    API Uptime: {apiStatus.Result.Uptime}<br />
                    API Version: {apiStatus.Result.Version}<br />
                    App Version: {appVersion}<br />
                    App Uptime: {`${process.uptime()} seconds`}<br />
                </AlertDescription>
            </Alert>
            {children}
        </Suspense>
        </body>
        </html>
    );
}
