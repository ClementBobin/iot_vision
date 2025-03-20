"use client";

import { useState, useEffect } from "react";
import { Line, LineChart, LabelList, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "./chart";
import {
    TransformResults,
    TransformResult
} from "@/lib/transform";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { Label } from "./label";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";

interface ChartCanvasProps {
    charts: TransformResults[]; // Array of chart data.
    preset: any; // Preset configurations.
    params: any; // Additional parameters.
}

export function ChartCanvas({ charts, preset, params }: ChartCanvasProps) {
    // State variables for time range, filtered data, popover open state, and selected value.
    const [timeRange, setTimeRange] = useState("forever");
    const [filteredData, setFilteredData] = useState<TransformResults[]>(charts);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string>("");
    const router = useRouter();
    const [date, setDate] = useState<DateRange | undefined>(undefined);

    // Effect to filter data based on the selected time range and date range.
    useEffect(() => {
        const filterData = () => {
            return charts.map((chart) => {
                const filteredChartData = chart.chartData.filter((item: { date: string }) => {
                    const itemDate = new Date(item.date);
                    const timeStart = new Date();
                    switch (timeRange) {
                        case "forever":
                            return true;
                        case "90d":
                            timeStart.setDate(timeStart.getDate() - 90);
                            return itemDate >= timeStart;
                        case "30d":
                            timeStart.setDate(timeStart.getDate() - 30);
                            return itemDate >= timeStart;
                        case "7d":
                            timeStart.setDate(timeStart.getDate() - 7);
                            return itemDate >= timeStart;
                        default:
                            return true;
                    }
                });

                if (date) {
                    return {
                        ...chart,
                        chartData: filteredChartData.filter((item: { date: string }) => {
                            const itemDate = new Date(item.date);
                            return date.from && date.to && itemDate >= date.from && itemDate <= date.to;
                        }),
                    };
                }

                return {
                    ...chart,
                    chartData: filteredChartData,
                };
            });
        };

        const filteredDataResult = filterData();
        console.log(filteredDataResult);
        if (JSON.stringify(filteredData) !== JSON.stringify(filteredDataResult)) {
            setFilteredData(filteredDataResult);
        }
    }, [charts, timeRange, date]);

    // Function to set query parameters in the URL.
    function setQuery(query: any) {
        console.log(query);
        const searchParams = new URLSearchParams(params);

        for (const key in query) {
            if (query[key] === "") {
                searchParams.delete(key);
            } else {
                searchParams.set(key, query[key]);
            }
        }

        router.push(`?${searchParams.toString()}`);
    }

    return (
        <Card>
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row flex-wrap">
                <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle>Graphique de Line - Interactif</CardTitle>
                    <CardDescription>
                        {params.DescriptionQuery ? params.DescriptionQuery : "Aucune description disponible."}
                    </CardDescription>
                </div>
                <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
                    <div className="flex items-center gap-2">
                        <Label>Intervale en minutes:</Label>
                        <Input
                            className="rounded-lg w-full"
                            placeholder="Intervale..."
                            value={params.IntervaleQueryMinutes || ""}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                if (/^[1-9]\d*$/.test(newValue) || newValue === "") {
                                    const newParams = { ...params, IntervaleQueryMinutes: newValue };
                                    setQuery(newParams);
                                }
                            }}
                        />
                    </div>
                    <Select value={timeRange} onValueChange={(newValue) => { setTimeRange(newValue); setDate(undefined); }}>
                        <SelectTrigger className="w-full rounded-lg" aria-label="Select a value">
                            <SelectValue placeholder="Last 3 months" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="forever" className="rounded-lg">Pour toujours</SelectItem>
                            <SelectItem value="90d" className="rounded-lg">Les 3 derniers mois</SelectItem>
                            <SelectItem value="30d" className="rounded-lg">Les 30 derniers jours</SelectItem>
                            <SelectItem value="7d" className="rounded-lg">Les 7 derniers jours</SelectItem>
                        </SelectContent>
                    </Select>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between overflow-clip rounded-lg"
                            >
                                {value ? value : (params.NameQuery ? params.NameQuery : "Sélectionner un preset...")}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Rechercher un preset..." />
                                <CommandList>
                                    <CommandEmpty>Aucune requête trouvée.</CommandEmpty>
                                    <CommandGroup>
                                        {preset.map((query: { NameQuery: string }) => (
                                            <CommandItem
                                                key={query.NameQuery}
                                                value={query.NameQuery}
                                                onSelect={(currentValue) => {
                                                    setValue(currentValue === value ? "" : currentValue);
                                                    setOpen(false);
                                                    setQuery(query);
                                                }}
                                            >
                                                <Check
                                                    className={`mr-2 h-4 w-4 ${value === query.NameQuery ? "opacity-100" : "opacity-0"}`}
                                                />
                                                {query.NameQuery}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                {filteredData.length > 0 ? (
                    filteredData.map((chart, index) => (
                        <ChartCanvasContainer key={index} chart={chart} />
                    ))
                ) : (
                    <p className="text-center">Aucune donnée disponible pour la période sélectionnée.</p>
                )}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon />
                            {date ? (
                                <span>
                                    {date.from?.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })}{" "}
                                    -{" "}
                                    {date.to?.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </span>
                            ) : (
                                "Sélectionnez une plage de dates"
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            selected={date}
                            onSelect={(selectedDate) => {
                                setDate(selectedDate);
                                setTimeRange("forever");
                            }}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </CardContent>
        </Card>
    );
}

function ChartCanvasContainer({ chart }: { chart: TransformResult }) {
    const chartConfig = chart.chartConfig satisfies ChartConfig;
    const chartData = chart.chartData;

    return (
        <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
        >
            <LineChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={16}
                    tickFormatter={(value) => {
                        // Get the name of the chart from the config object last label
                        const name = Object.keys(chartConfig)[Object.keys(chartConfig).length - 1].toUpperCase();
                        if (name === "ITOTAL") {
                            return `${value} A`;
                        }
                        if (name === "TOTALWATT") {
                            return `${value} W`;
                        }
                        return value.toString();
                    }}
                />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                        });
                    }}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent
                        labelFormatter={(value) => {
                            return new Date(value).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                            });
                        }}
                        indicator="line"
                    />}
                />
                {Object.keys(chartConfig).map((key) => (
                    <Line
                        key={key}
                        dataKey={key}
                        type="natural"
                        stroke={chartConfig[key].color}
                        strokeWidth={2}
                        dot={{ fill: chartConfig[key].color }}
                    />
                ))}
                <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                />
                <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
        </ChartContainer>
    );
}