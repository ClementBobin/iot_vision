export const transform = async (data: any[]) => {
    // Récupérer tous les DevEUIs
    const allDevEUIs = new Set<string>();
    data.forEach(record => allDevEUIs.add(record.DevEUI));

    // Fonction pour arrondir un timestamp à la tranche de 30 minutes la plus proche
    const roundToNearest30Min = (isoTime: string) => {
        const date = new Date(isoTime);
        const minutes = date.getUTCMinutes();
        date.setUTCMinutes(minutes - (minutes % 30), 0, 0);
        return date.toISOString().slice(0, 16); // Garde "YYYY-MM-DDTHH:mm"
    };

    // Stockage des valeurs par tranche de 30 minutes
    const aggregatedData: Record<string, Record<string, number>> = {};

    data.forEach(record => {
        record.Data.forEach((entry: { Time: string; Value: number }) => {
            const roundedTime = roundToNearest30Min(entry.Time);
            const devEUI = record.DevEUI;

            if (!aggregatedData[roundedTime]) {
                aggregatedData[roundedTime] = {};
            }

            // Enregistrer la valeur de l'appareil
            aggregatedData[roundedTime][devEUI] = entry.Value;
        });
    });

    // Convertir l'objet en tableau et remplir les valeurs manquantes avec -4.04
    const transformedData = Object.entries(aggregatedData).map(([date, devices]) => {
        const completeEntry: Record<string, number | string> = { date };

        allDevEUIs.forEach(devEUI => {
            completeEntry[devEUI] = devices[devEUI] ?? -4.04; // Valeur par défaut si absente
        });

        return completeEntry;
    });

    // Générer des couleurs aléatoires
    const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

    // Configuration du graphique
    const chartConfig = {
        views: {
            label: "Value",
            color: getRandomColor()
        },
        ...Array.from(allDevEUIs).reduce((acc, devEUI) => {
            acc[devEUI] = {
                label: devEUI,
                color: getRandomColor()
            };
            return acc;
        }, {} as Record<string, { label: string; color: string }>),
    };

    return { chartData: transformedData, chartConfig };
};

export type ChartConfig = { views: { label: string } } & Record<string, { label: string; color: string }>;
export type ChartDataEntry = {
    date: string;
} & Record<string, number>; // DevEUI keys with numeric values

export type TransformResult = {
    chartData: ChartDataEntry[];
    chartConfig: ChartConfig;
};