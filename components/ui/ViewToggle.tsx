"use client"

import { Suspense } from "react";
import { ChartCanvas } from "@/components/ui/ChartCanvas";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartConfig, ChartDatas } from "@/lib/transform";
import QueryForm from "@/components/ui/Query";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { ClientLogger } from "@/lib/api.client";

// Define the props interface for the ViewToggle component
interface ViewToggleProps {
    chartData: ChartDatas; // Type for chart data
    config: ChartConfig; // Type for chart configuration
    preset: any; // Type for preset (replace 'any' with the appropriate type if known)
    params: any; // Type for parameters (replace 'any' with the appropriate type if known)
}

// Define the ViewToggle functional component
const ViewToggle: React.FC<ViewToggleProps> = ({ chartData, config, preset, params }) => {
    // Log the chartData, config, preset, and params for debugging purposes
    console.log(`chartData: ${JSON.stringify(chartData)}`);
    console.log(`config: ${JSON.stringify(config)}`);
    console.log(`preset: ${JSON.stringify(preset)}`);
    console.log(`params: ${JSON.stringify(params)}`);

    return (
        <div className="m-6 w-[80%] mt-50 md:mt-0">                    
            {
                // Display a message if no data is found
                chartData.length == 0 && <div className="text-red-500 bg-red-100 p-4 rounded">Aucune données n'a été trouver</div>
            }
            {/* Tabs component to switch between chart and query views */}
            <Tabs defaultValue="chart" className="mt-4">
                {/* TabsList component to define the tab triggers */}
                <TabsList className="grid w-full grid-cols-2">
                    {/* TabsTrigger component for the chart view */}
                    <TabsTrigger value="chart">Graphique</TabsTrigger>
                    {/* TabsTrigger component for the query view */}
                    <TabsTrigger value="query">Requête</TabsTrigger>
                </TabsList>
                {/* TabsContent component for the chart view */}
                <TabsContent value="chart">
                    {/* Suspense component to show a fallback skeleton while loading */}
                    <Suspense fallback={<Skeleton />}>
                        {/* ChartCanvas component to render the chart */}
                        <ChartCanvas chartData={chartData} config={config} preset={preset} params={params} />
                    </Suspense>
                </TabsContent>
                {/* TabsContent component for the query view */}
                <TabsContent value="query">
                    {/* QueryForm component to render the query form */}
                    <QueryForm />
                </TabsContent>
            </Tabs>
        </div>
    );
};

// Export the ViewToggle component as the default export
export default ViewToggle;