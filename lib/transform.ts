import logger from "@/lib/docs/logger";

// Main function to transform data
export const transform = async (data: any[], n: number = 30) => {
    // Log the start of the transformation process
    logger.debug(`Transforming data with interval ${n} minutes`);
    logger.debug(`Transforming data: ${JSON.stringify(data)}`);

    // Check if the data is empty
    if (!data || data.length === 0) {
        logger.warn("No data to transform");
        return { chartData: [], chartConfig: {} };
    }

    // Collect all unique DevEUIs from the data
    const allDevEUIs = new Set<string>();
    data.forEach(record => allDevEUIs.add(record.DevEUI));

    // Log all collected DevEUIs
    logger.debug(`All DevEUIs: ${JSON.stringify(allDevEUIs)}`);

    // Function to round a timestamp to the nearest n minutes
    const roundToNearestNMin = (isoTime: string, n: number, offset: number = 0) => {
        logger.debug(`isoTime: ${isoTime}`);
        logger.debug(`n: ${n}`);
        logger.debug(`offset: ${offset}`);

        const date = new Date(isoTime);
        logger.debug(`date: ${date}`);

        const minutes = date.getUTCMinutes();
        logger.debug(`minutes: ${minutes}`);

        date.setUTCMinutes(minutes - (minutes % n), 0, 0);
        date.setUTCMilliseconds(offset);
        const result = date.toISOString().slice(0, 23); // Keep "YYYY-MM-DDTHH:mm:ss.SSS"
        logger.debug(`result: ${result}`);

        return result;
    };

    // Storage for aggregated values by 30-minute intervals
    const aggregatedData: Record<string, Record<string, number>> = {};

    // Track the number of entries for each DevEUI and time
    const entryCount: Record<string, number> = {};

    // Aggregate data by rounding timestamps and storing values
    data.forEach(record => {
        record.Data.forEach((entry: { Time: string; Value: number, ValueRaw: number }) => {
            const devEUI = record.DevEUI;
            const baseTime = roundToNearestNMin(entry.Time, n);
            const key = `${baseTime}-${devEUI}`;

            // Increment the count for this DevEUI and time
            entryCount[key] = (entryCount[key] || 0) + 1;
            const offset = entryCount[key] - 1;

            const roundedTime = roundToNearestNMin(entry.Time, n, offset);

            if (!aggregatedData[roundedTime]) {
                aggregatedData[roundedTime] = {};
            }

            // Store the device value in the aggregated data object by rounded time and DevEUI key (with raw value if value is 0)
            aggregatedData[roundedTime][devEUI] = entry.Value === 0 ? entry.ValueRaw : entry.Value;
        });
    });

    // Log the aggregated data
    logger.debug(`Aggregated data: ${JSON.stringify(aggregatedData)}`);

    // Convert the aggregated data object to an array and fill missing values with -0.001
    const transformedData = Object.entries(aggregatedData).map(([date, devices]) => {
        const completeEntry: Record<string, number | string> = { date };

        allDevEUIs.forEach(devEUI => {
            completeEntry[devEUI] = devices[devEUI] ?? null; // Default value if absent
        });

        // Add the sum of all device values
        completeEntry.total = Object.values(devices).reduce((acc, value) => acc + (value || 0), 0);

        return completeEntry;
    });

    // Sort the transformed data by date
    transformedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Function to generate random colors for each device based on its DevEUI (seed)
    const getRandomColor = (seed: string) => {
        const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return `#${((hash * 1234567) % 16777215).toString(16).padStart(6, '0')}`;
    };

    // Configuration for the chart
    const chartConfig = {
        ...Array.from(allDevEUIs).reduce((acc, devEUI) => {
            const record = data.find(record => record.DevEUI === devEUI);
            const valueType = record?.Data[0].ValueType || record?.Data[0].ValueTypeRaw || "";
            acc[devEUI] = {
                label: `${valueType} ${record?.CapteurName || devEUI}` || `${devEUI}`,
                color: getRandomColor(devEUI)
            };
            return acc;
        }, {} as Record<string, { label: string; color: string }>),
        total: {
            label: "Total",
            color: getRandomColor("total")
        }
    };

    // Log the transformed data
    const result = { chartData: transformedData, chartConfig };
    logger.debug(`Transformed data: ${JSON.stringify(result)}`);
    return result;
};

// Type definitions for the chart configuration and data
export type ChartConfig = { views: { label: string } } & Record<string, { label: string; color: string }>;
export type ChartDataEntry = {
    date: string;
} & Record<string, number>; // DevEUI keys with numeric values

export type ChartDatas = ChartDataEntry[];

export type TransformResult = {
    chartData: ChartDatas;
    chartConfig: ChartConfig;
};