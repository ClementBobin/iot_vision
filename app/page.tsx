"use server";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { transform } from "@/lib/transform";
import ViewToggle from "@/components/ui/ViewToggle";
// import json config file for api url preset
import config from "@/config/api.route.json";
import { searchReleverCapteur } from "@/lib/api";
import logger from "@/lib/docs/logger";

export default async function Page({ searchParams }: { searchParams: { [key: string]: string | string[] } }) {
    const params = await searchParams;
    // Log debug params
    logger.debug(`Params: ${JSON.stringify(params)}`);
    
    const interval = params.IntervaleQuery ? Number(params.IntervaleQuery) : 30;

    const queryParams = { ...params };
    delete queryParams.NameQuery;
    delete queryParams.DescriptionQuery;
    delete queryParams.IntervaleQuery;
    const dataApiTable = await searchReleverCapteur(queryParams);
    // Log debug dataApiTable
    logger.debug(`Data API Table: ${JSON.stringify(dataApiTable)}`);

    const dataApi : any = await transform(dataApiTable.Results, interval);
    // Log debug dataApi
    logger.debug(`Data API: ${JSON.stringify(dataApi)}`);

    try {
        return (
            <div className="min-h-screen flex flex-col  items-center justify-center">
                <Suspense fallback={<Skeleton />}>
                    {/* Pass the transformed data to the ViewToggle component if not null */}
                    {
                        dataApi.chartData.length > 0 && <ViewToggle chartData={dataApi.chartData} config={dataApi.chartConfig} preset={config} params={params} />
                    }
                </Suspense>
            </div>
        );
    } catch (error) {
        logger.logWithErrorHandling("Error fetching or transforming data:", error);
        return <div className="text-red-500 bg-red-100 p-4 rounded">Error loading data</div>;
    }
}