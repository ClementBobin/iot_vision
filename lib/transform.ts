import logger from "@/lib/docs/logger";

export const transform = async (data: any[], n: number = 30) => {
    logger.debug(`Transforming data with interval ${n} minutes`);
    logger.debug(`Transforming data: ${JSON.stringify(data)}`);
    
    // Vérifier si les données sont vides
    if (!data || data.length === 0) {
        logger.warn("No data to transform");
        return { chartData: [], chartConfig: {} };
    }
    
    // Récupérer tous les DevEUIs
    const allDevEUIs = new Set<string>();
    data.forEach(record => allDevEUIs.add(record.DevEUI));
    
    // Console log the DevEUIs
    logger.debug(`All DevEUIs: ${JSON.stringify(allDevEUIs)}`);

    // Fonction pour arrondir un timestamp à la tranche de n minutes la plus proche
    const roundToNearestNMin = (isoTime: string, n : number) => {
        // log the isoTime and n
        logger.debug(`isoTime: ${isoTime}`);
        logger.debug(`n: ${n}`);
        
        const date = new Date(isoTime);
        // log the date
        logger.debug(`date: ${date}`);
        
        const minutes = date.getUTCMinutes();
        // log the minutes
        logger.debug(`minutes: ${minutes}`);
        
        date.setUTCMinutes(minutes - (minutes % n), 0, 0);
        const result = date.toISOString().slice(0, 16); // Garde "YYYY-MM-DDTHH:mm"
        // log the result
        logger.debug(`result: ${result}`);
        
        return result;
    };

    // Stockage des valeurs par tranche de 30 minutes
    const aggregatedData: Record<string, Record<string, number>> = {};

    data.forEach(record => {
        record.Data.forEach((entry: { Time: string; Value: number }) => {
            const roundedTime = roundToNearestNMin(entry.Time, n);
            const devEUI = record.DevEUI;

            if (!aggregatedData[roundedTime]) {
                aggregatedData[roundedTime] = {};
            }

            // Enregistrer la valeur de l'appareil
            aggregatedData[roundedTime][devEUI] = entry.Value;
        });
    });
    
    // Console log the aggregated data
    logger.debug(`Aggregated data: ${JSON.stringify(aggregatedData)}`);

    // Convertir l'objet en tableau et remplir les valeurs manquantes avec -4.04
    const transformedData = Object.entries(aggregatedData).map(([date, devices]) => {
        const completeEntry: Record<string, number | string> = { date };

        allDevEUIs.forEach(devEUI => {
            completeEntry[devEUI] = devices[devEUI] ?? -0.001; // Valeur par défaut si absente
        });
        
        // Ajouter la somme des valeurs de tous les appareils
        completeEntry.total = Object.values(devices).reduce((acc, value) => {
            if (value === -0.001) {
                return acc;
            }
            return acc + value;
        }, 0) + Object.values(devices).filter(value => value === -0.001).length * 0.001;

        return completeEntry;
    });

    // Générer des couleurs aléatoires pour chaque appareil à partir de son DevEUI (seed)
    const getRandomColor = (seed: string) => {
        const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return `#${((hash * 1234567) % 16777215).toString(16).padStart(6, '0')}`;
    };

    // Configuration du graphique
    const chartConfig = {
        ...Array.from(allDevEUIs).reduce((acc, devEUI) => {
            acc[devEUI] = {
                label: devEUI,
                color: getRandomColor(devEUI)
            };
            return acc;
        }, {} as Record<string, { label: string; color: string }>),
        total: {
            label: "Total",
            color: getRandomColor("total")
        }
    };

    const result = { chartData: transformedData, chartConfig };
    logger.debug(`Transformed data: ${JSON.stringify(result)}`);
    return result;
};

export type ChartConfig = { views: { label: string } } & Record<string, { label: string; color: string }>;
export type ChartDataEntry = {
    date: string;
} & Record<string, number>; // DevEUI keys with numeric values

export type ChartDatas = ChartDataEntry[];

export type TransformResult = {
    chartData: ChartDatas;
    chartConfig: ChartConfig;
};