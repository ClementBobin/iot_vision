"use server";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { transform } from "@/lib/transform";
import ViewToggle from "@/components/ui/ViewToggle";

export default async function Page() {

    const dataApiTable = [
        {
          "DevEUI": "00-18-b2-10-00-01-17-f0",
          "Data": [
            {
              "Time": "2025-03-14T07:33:36.490Z",
              "Value": 1.505
            },
            {
              "Time": "2025-03-14T08:12:45.120Z",
              "Value": 2.123
            }
          ]
        },
        {
          "DevEUI": "00-18-b2-10-00-01-17-f1",
          "Data": [
            {
              "Time": "2025-03-14T07:35:36.490Z",
              "Value": 1.545
            },
            {
              "Time": "2025-03-14T09:45:10.230Z",
              "Value": 3.200
            }
          ]
        }
      ];

    const dataApi = await transform(dataApiTable);

    console.log(dataApi);

    try {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Suspense fallback={<Skeleton />}>
                    {/* Pass the transformed data to the ViewToggle component if not null */}
                    {
                        dataApi.chartData.length > 0 && <ViewToggle chartData={dataApi.chartData} dataRecord={dataApiTable} config={dataApi.chartConfig}/>
                    }
                </Suspense>
            </div>
        );
    } catch (error) {
        console.error("Error fetching or transforming data:", error);
        return <div className="text-red-500 bg-red-100 p-4 rounded">Error loading data</div>;
    }
}