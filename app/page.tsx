"use server";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ViewToggle from "@/components/ui/ViewToggle";

export default async function Page({ searchParams }: { searchParams: { [key: string]: string | string[] } }) {
    const params = await searchParams;

    const dataApi = [
        { id: 1, name: "Sensor A", value: 42 },
        { id: 2, name: "Sensor B", value: 36 },
        { id: 3, name: "Sensor C", value: 58 }
    ];
    const dataApiTable = [
        { id: 1, name: "Sensor A", value: 42, timestamp: "2023-10-01T10:00:00Z", hasSite: ["Site A", "Site B"] },
        { id: 2, name: "Sensor B", value: 36, timestamp: "2023-10-01T10:05:00Z", hasSite: ["Site B", "Site C"] },
        { id: 3, name: "Sensor C", value: 58, timestamp: "2023-10-01T10:10:00Z", hasSite: ["Site C", "Site A"] },
        { id: 4, name: "Sensor B", value: 23, timestamp: "2023-10-01T10:15:00Z", hasSite: ["Site A", "Site B", "Site C"] }
    ];

    try {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Suspense fallback={<Skeleton />}>
                    {/* Pass the transformed data to the ViewToggle component if not null */}
                    {
                        dataApi.length > 0 && <ViewToggle chartData={dataApi} dataRecord={dataApiTable} dataType={params.dataType as string}/>
                    }
                </Suspense>
            </div>
        );
    } catch (error) {
        console.error("Error fetching or transforming data:", error);
        return <div className="text-red-500 bg-red-100 p-4 rounded">Error loading data</div>;
    }
}