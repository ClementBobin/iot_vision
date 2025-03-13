"use client"

import { useState } from "react";
import { Suspense } from "react";
import { ChartCanvas } from "@/components/ui/ChartCanvas";
import { DataTable } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/skeleton";

interface ViewToggleProps {
    chartData: any; // Replace 'any' with the appropriate type
    dataRecord: any; // Replace 'any' with the appropriate type
    dataType: string;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ chartData, dataRecord, dataType }) => {
    const [view, setView] = useState<'chart' | 'table'>('chart');
    console.log(chartData);

    return (
        <div className="m-6 flex flex-col items-center justify-center">
            <div className="flex justify-center mb-4">
                <button onClick={() => setView('chart')} className={`px-4 py-2 ${view === 'chart' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Chart</button>
                <button onClick={() => setView('table')} className={`px-4 py-2 ${view === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Table</button>
            </div>
            <Suspense fallback={<Skeleton />}>
                {view === 'chart' ? (
                    <ChartCanvas chartData={chartData} dataType={dataType} />
                ) : (
                    <DataTable data={dataRecord} itemsPerPage={2} />
                )}
            </Suspense>
        </div>
    );
};

export default ViewToggle;