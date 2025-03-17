"use client"

import { Suspense } from "react";
import { ChartCanvas } from "@/components/ui/ChartCanvas";
import { Skeleton } from "@/components/ui/skeleton";
import {ChartConfig, ChartDatas} from "@/lib/transform";
import QueryForm from "@/components/ui/Query";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import logger from "@/lib/docs/logger";

interface ViewToggleProps {
    chartData: ChartDatas; // Replace 'any' with the appropriate type
    config: ChartConfig;
    preset: any;
    params: any;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ chartData, config, preset, params }) => {
    // Log the chartData, config, preset and params
    // logger.debug(`chartData: ${JSON.stringify(chartData)}`);
    // logger.debug(`config: ${JSON.stringify(config)}`);
    // logger.debug(`preset: ${JSON.stringify(preset)}`);
    // logger.debug(`params: ${JSON.stringify(params)}`);

    return (
        <Tabs defaultValue="chart"  className="m-6 w-[80%]">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chart">Chart</TabsTrigger>
                <TabsTrigger value="query">Query</TabsTrigger>
            </TabsList>
            <TabsContent value="chart">
                <Suspense fallback={<Skeleton />}>
                    <ChartCanvas chartData={chartData} config={config} preset={preset} params={params} />
                </Suspense>
            </TabsContent>
            <TabsContent value="query">
                <QueryForm />
            </TabsContent>
        </Tabs>
    );
};

export default ViewToggle;