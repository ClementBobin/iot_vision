"use server"; // Indicates that this file is a server-side module

import { Suspense } from "react"; // Import Suspense for lazy loading
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component for loading state
import { transform } from "@/lib/transform"; // Import transform function to process data
import ViewToggle from "@/components/ui/ViewToggle"; // Import ViewToggle component for displaying data
import config from "@/config/api.route.json"; // Import API route configuration
import { searchReleverCapteur } from "@/lib/api.server"; // Import function to fetch sensor data
import logger from "@/lib/docs/logger"; // Import logger for debugging

// Define the main Page component as an async function
export default async function Page({ searchParams }: { searchParams: { [key: string]: string | string[] } }) {
    // Await the search parameters
    const params = await searchParams;
    // Log the search parameters for debugging
    logger.debug(`Params: ${JSON.stringify(params)}`);
    
    // Set the interval for querying data, defaulting to 30 minutes if not provided
    const interval = params.IntervaleQueryMinutes ? Number(params.IntervaleQueryMinutes) : 30;

    // Clone the search parameters and remove specific keys that are not needed for the API call
    const queryParams = { ...params };
    delete queryParams.NameQuery;
    delete queryParams.DescriptionQuery;
    delete queryParams.IntervaleQueryMinutes;

    // Fetch data from the API using the filtered query parameters
    const dataApiTable = await searchReleverCapteur(queryParams);
    // Log the raw data fetched from the API for debugging
    logger.debug(`Data API Table: ${JSON.stringify(dataApiTable)}`);

    // Transform the raw data using the transform function
    const dataApi: any = await transform(dataApiTable.Results, interval);
    // Log the transformed data for debugging
    logger.debug(`Data API: ${JSON.stringify(dataApi)}`);

    try {
        // Return the JSX to render the page
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Suspense fallback={<Skeleton />}>
                    {/* Pass the transformed data to the ViewToggle component */}
                    <ViewToggle chartData={dataApi.chartData} config={dataApi.chartConfig} preset={config} params={params} />
                </Suspense>
            </div>
        );
    } catch (error) {
        // Log any errors that occur during data fetching or transformation
        logger.logWithErrorHandling("Error fetching or transforming data:", error);
        // Display an error message if an exception is caught
        return <div className="text-red-500 bg-red-100 p-4 rounded">Erreur lors du chargement des données</div>;
    }
}