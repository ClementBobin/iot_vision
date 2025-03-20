import logger from "@/lib/docs/logger";

// Function to round a timestamp to the nearest n minutes
const roundToNearestNMin = (isoTime: string, n: number) => {
    logger.debug(`isoTime: ${isoTime}`);
    logger.debug(`n: ${n}`);

    const date = new Date(isoTime);
    logger.debug(`date: ${date}`);

    const minutes = date.getUTCMinutes();
    logger.debug(`minutes: ${minutes}`);

    date.setUTCMinutes(minutes - (minutes % n), 0, 0);
    const result = date.toISOString().slice(0, 19); // Keep "YYYY-MM-DDTHH:mm:ss"
    logger.debug(`result: ${result}`);

    return result;
};

export const additional = (data: ChartDatas, valueTypes: Array<string>, configInit: ChartConfig) => {
    // Log the start of the transformation process
    logger.debug(`Transforming additional data`);
    logger.debug(`ValueTypes: ${JSON.stringify(valueTypes)}`);
    logger.debug(`Config Init: ${JSON.stringify(configInit)}`);
    logger.info(`Transforming data: ${JSON.stringify(data)}`);

    // Check if the data is empty
    if (!data || data.length === 0 || valueTypes.length > 2) {
        logger.warn("No data to transform");
        return [];
    }

    let timeArray: Array<string> = [];
    // retireve all config.key.label in a list
    const deviceEUI = Object.keys(configInit).filter(key => key !== "views" && key !== "Total" && key !== "ITotal");
    logger.info(`Device EUI: ${JSON.stringify(deviceEUI)}`);
    switch (valueTypes[0]) {
        case "A":
            logger.debug("ValueType A");

            // p = Racine carré(3) u * i * cos phi
            // calculate the total power for each device
            const deviceWatt = deviceEUI.map((name, i) => {
                const deviceData = data.map(record => record[name] || 0);
                timeArray = data.map(record => record.date);
                const deviceWatt = deviceData.map(i => Math.sqrt(3) * 230 * i * 0.9);
                return deviceWatt;
            });
            logger.info(`Device Watt: ${JSON.stringify(deviceWatt)}`);

            // calculate the total power
            const totalWatt = deviceWatt.reduce((acc, device) => device.map((value, i) => acc[i] = (acc[i] || 0) + value), []);

            // Merge the deviceWatt and totalWatt into a single object with the date from the timeArray
            const mergedData = timeArray.map((date, index) => ({
                date,
                ...deviceEUI.reduce((acc, name, i) => {
                    acc[name] = deviceWatt[i][index] || 0;
                    return acc;
                }, {} as Record<string, number>),
                TotalWatt: totalWatt[index]
            }));

            logger.info(`Merged data: ${JSON.stringify(mergedData)}`);

            const config = {
                // for each device show the total power
                ...deviceEUI.reduce((acc, name) => {
                    acc[name] = {
                        label: `${configInit[name].label}`,
                        color: `#${((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0')}`
                    };
                    return acc;
                }, {} as Record<string, { label: string; color: string }>),
                TotalWatt: {
                    label: 'Total Watt',
                    color: '#000000' // Black color for totalWatt
                },
            };

            return [{ chartData: mergedData, chartConfig: config }];
        default:
            return null;
    }
}




// Main function to transform data
export const transform = async (data: any[], n: number = 30) => {
    // Log the start of the transformation process
    logger.debug(`Transforming data with interval ${n} minutes`);
    logger.debug(`Transforming data: ${JSON.stringify(data)}`);

    // Check if the data is empty
    if (!data || data.length === 0) {
        logger.warn("No data to transform");
        return [];
    }


    // Storage for aggregated values by 30-minute intervals
    const aggregatedData: Record<string, Record<string, number>> = {};

    // Track the number of entries for each DevEUI and time
    const entryCount: Record<string, number> = {};

    // retireve all record?.Data.ValueType in a list and remove duplicates
    const valueTypes = data.map(record => record.Data[0].ValueType).filter((value, index, self) => self.indexOf(value) === index);

    // Aggregate data by rounding timestamps and storing values
    data.forEach(record => {
        record.Data.forEach((entry: { Time: string; Value: number, ValueRaw: number }) => {
            logger.debug(`Entry: ${JSON.stringify(entry)}`);
            const devEUI = record.DevEUI;
            const baseTime = roundToNearestNMin(entry.Time, n);
            const key = `${baseTime}-${devEUI}`;

            // Increment the count for this DevEUI and time
            entryCount[key] = (entryCount[key] || 0) + 1;

            const roundedTime = roundToNearestNMin(entry.Time, n);

            // store the device value in the aggregated data object by rounded time and DevEUI key (with raw value if value is 0)
            if (!aggregatedData[roundedTime]) {
                aggregatedData[roundedTime] = {};
            }

            if (!aggregatedData[roundedTime][devEUI] || aggregatedData[roundedTime][devEUI] < (entry.Value === 0 ? entry.ValueRaw : entry.Value)) {
                aggregatedData[roundedTime][devEUI] = entry.Value === 0 ? entry.ValueRaw : entry.Value;
            }
        });
    });

    // Log the aggregated data
    logger.debug(`Aggregated data: ${JSON.stringify(aggregatedData)}`);

    // Collect all unique DevEUIs from the aggregated data
    const allDevEUIs = new Set<string>();
    Object.values(aggregatedData).forEach(devices => Object.keys(devices).forEach(devEUI => allDevEUIs.add(devEUI)));

    // Log all collected DevEUIs
    logger.debug(`All DevEUIs: ${JSON.stringify(allDevEUIs)}`);

    // Convert the aggregated data object to an array
    const transformedData = Object.entries(aggregatedData).map(([date, devices]) => {
        logger.debug(`Date: ${date}`);
        logger.debug(`Devices: ${JSON.stringify(devices)}`);

        const completeEntry: Record<string, number | string> = { date };

        allDevEUIs.forEach(devEUI => {
            completeEntry[devEUI] = devices[devEUI] ?? null; // Default value if absent
        });

        logger.debug(`Complete entry: ${JSON.stringify(completeEntry)}`);

        logger.debug(`ValueTypes: ${JSON.stringify(valueTypes)}`);

        if (valueTypes.length != 1) {
            logger.debug("Multiple ValueType");
            logger.debug("Default ValueType");
            // Add the sum of all device values
            completeEntry.total = Object.values(devices).reduce((acc, value) => acc + (value || 0), 0);
            logger.debug(`Complete entry: ${JSON.stringify(completeEntry)}`);
            return completeEntry;
        }

        // switch on the first value type and chack also if there more than one value type
        switch (valueTypes[0]) {
            case "A":
                logger.debug("ValueType A");
                // Total of all devices with ValueType A is given by I Total = Racine carré (I1²+I2²+I3²)
                completeEntry.ITotal = Math.sqrt(Object.values(devices).reduce((acc, value) => acc + Math.pow(value || 0, 2), 0));
                // 
                break;
            default:
                logger.debug("Default ValueType");
                // Add the sum of all device values
                completeEntry.Total = Object.values(devices).reduce((acc, value) => acc + (value || 0), 0);
                break;
        }

        logger.debug(`Complete entry: ${JSON.stringify(completeEntry)}`);
        return completeEntry;
    });

    // Sort the transformed data by date
    transformedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Function to generate random colors for each device based on its DevEUI (seed)
    const getRandomColor = (seed: string) => {
        // Generate a color based on the sum of the ASCII values of the seed characters
        const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        // Convert the hash to a 6-digit hexadecimal string
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
        ...(() => {
            const totals = transformedData.reduce((acc, entry) => {
                if (entry.Total !== undefined) {
                    acc.Total = {
                        label: 'Total',
                        color: '#000000' // Black color for total
                    };
                }
                if (entry.ITotal !== undefined) {
                    acc.ITotal = {
                        label: 'Intensité Ampère',
                        color: '#FF0000' // Red color for ITotal
                    };
                }
                if (entry.Total !== undefined) {
                    acc.Total = {
                        label: 'Total',
                        color: '#000000' // Black color for total
                    };
                }
                return acc;
            }, {} as Record<string, { label: string; color: string }>);
            return totals;
        })()
    };

    // Log the transformed data
    const additionalData = additional(transformedData, valueTypes, chartConfig) || [];
    const result = [{ chartData: transformedData, chartConfig }, ...additionalData];
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

export type TransformResults = TransformResult[];