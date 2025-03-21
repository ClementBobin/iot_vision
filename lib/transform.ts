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
    logger.debug(`Transforming data: ${JSON.stringify(data)}`);

    // Check if the data is empty
    if (!data || data.length === 0 || valueTypes.length > 2) {
        logger.warn("No data to transform");
        return [];
    }

    const timeArray: Array<string> = data.map((entry) => entry.date);


    // retireve all config.key.label in a list
    const deviceEUI = Object.keys(configInit).filter(key => key !== "views" && key !== "Total" && key !== "ITotal");
    logger.debug(`Device EUI: ${JSON.stringify(deviceEUI)}`);
    switch (valueTypes[0]) {
        case "A":
            logger.debug("ValueType A");

            // p = Racine carré(3) * 400 * i * 0.90
            // calculate the total power
            const totalWatt = data.map((entry) => { return Math.sqrt(3) * 400 * entry.ITotal * 0.90 });

            // Merge the deviceWatt and totalWatt into a single object with the date from the timeArray
            const mergedData = timeArray.map((date, index) => ({
                date,
                TotalWatt: totalWatt[index],
            }));

            logger.debug(`Merged data: ${JSON.stringify(mergedData)}`);

            const config = {
                TotalWatt: {
                    label: 'Puissance [W]',
                    color: '#000000' // Black color for totalWatt
                },
            };

            // Merge the deviceWatt and totalWatt into a single object with the date from the timeArray
            const mergedDataByHour = Object.values(
                mergedData.reduce((acc, entry) => {
                  const date = new Date(entry.date);
                  const hourKey = date.toISOString().slice(0, 13); // Format "YYYY-MM-DDTHH"
              
                  if (!acc[hourKey]) {
                    acc[hourKey] = { date: `${hourKey}:00:00`, TotalWatt: 0 };
                  }
              
                  acc[hourKey].TotalWatt += entry.TotalWatt; // Sum TotalWatt values for the same hour
              
                  return acc;
                }, {})
              ).map(({ date, TotalWatt }) => ({
                date,
                PowerHeure: TotalWatt * (1 / 6), // Apply the 1/6 factor
              }));

            const config2 = {
                PowerHeure: {
                    label: 'Consommation [Wh]',
                    color: '#000000' // Black color for totalWatt
                },
            };


            logger.debug(`Additional data: ${JSON.stringify([{ chartData: mergedData, chartConfig: config }])}`);
            logger.info(`Additional data: ${JSON.stringify([{ chartData: mergedData, chartConfig: config }, { chartData: mergedDataByHour, chartConfig: config2 }])}`);

            return [{ chartData: mergedData, chartConfig: config }, { chartData: mergedDataByHour, chartConfig: config2 }];
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
                        label: 'Intensité Totale [A]', 
                        color: '#FF0000' // Red color for ITotal
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