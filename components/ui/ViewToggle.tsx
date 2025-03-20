"use client"

import { Suspense } from "react";
import { ChartCanvas } from "@/components/ui/ChartCanvas";
import { Skeleton } from "@/components/ui/skeleton";
import type { TransformResults } from "@/lib/transform";
import QueryForm from "@/components/ui/Query";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

// Define the props interface for the ViewToggle component
interface ViewToggleProps {
    chart: TransformResults; // Type for chart data
    preset: any; // Type for preset (replace 'any' with the appropriate type if known)
    params: any; // Type for parameters (replace 'any' with the appropriate type if known)
}

// Define the ViewToggle functional component
const ViewToggle: React.FC<ViewToggleProps> = ({ chart, preset, params }) => {

    return (
        <div className="m-6 w-[80%] mt-50 md:mt-0">                    
            {chart.length === 0 && (
                <div className="text-red-500 bg-red-100 p-4 rounded">
                    Aucune donnée n'a été trouvée
                </div>
            )}
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
                        <ChartCanvas charts={chart}  preset={preset} params={params} />
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