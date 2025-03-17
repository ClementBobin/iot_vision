"use client"; // This directive indicates that the component is a client-side component.

import * as React from "react"; // Import React library.
import { useState } from "react"; // Import useState hook from React.
import { Line, LineChart, LabelList, CartesianGrid, XAxis } from "recharts"; // Import components from Recharts library.
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./card"; // Import custom Card components.
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "./chart"; // Import custom Chart components.
import {
    ChartConfig as ConfigType, ChartDatas
} from "@/lib/transform"; // Import types from a custom library.
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"; // Import custom Select components.
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Import custom Popover components.
import { Button } from "@/components/ui/button"; // Import custom Button component.
import { Input } from "@/components/ui/input"; // Import custom Input component.
import { Check, ChevronsUpDown } from "lucide-react"; // Import icons from lucide-react.
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"; // Import custom Command components.
import { useRouter } from "next/navigation"; // Import useRouter hook from Next.js.
import { Label } from "./label";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";

interface ChartCanvasProps {
    chartData: ChartDatas; // Data for the chart.
    config: ConfigType; // Configuration for the chart.
    preset: any; // Preset configurations.
    params: any; // Additional parameters.
}

// Main component function
export function ChartCanvas({ chartData, config, preset, params }: ChartCanvasProps) {
    // Log the chartData, config, preset, and params for debugging.
    console.log(`chartData: ${JSON.stringify(chartData)}`);
    console.log(`config: ${JSON.stringify(config)}`);
    console.log(`preset: ${JSON.stringify(preset)}`);
    console.log(`params: ${JSON.stringify(params)}`);
    
    // Ensure the config matches the ChartConfig type.
    const chartConfig = config satisfies ChartConfig;

    // State variables for time range, filtered data, popover open state, and selected value.
    const [timeRange, setTimeRange] = React.useState("90d");
    const [filteredData, setFilteredData] = React.useState(chartData);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string>("");
    const router = useRouter(); // Initialize router for navigation.
    const [date, setDate] = useState<DateRange | undefined>(undefined); // State for date range

    // Effect to filter data based on the selected time range and date range.
    React.useEffect(() => {
        const filterData = () => {
            console.log(`filterData: ${JSON.stringify(filterData)}`);
            console.log(`timeRange: ${JSON.stringify(timeRange)}`);
            
            if (timeRange === "forever" && !date) {
                return chartData;
            }
            
            const referenceDate = new Date();
            console.log(`referenceDate: ${JSON.stringify(referenceDate)}`);
            
            // Remove 'd' from timeRange to get the number of days to subtract.
            const daysToSubtract = parseInt(timeRange.replace("d", ""));
            console.log(`daysToSubtract: ${JSON.stringify(daysToSubtract)}`);

            const startDate = new Date(referenceDate);
            console.log(`startDate: ${JSON.stringify(startDate)}`);
            startDate.setDate(startDate.getDate() - daysToSubtract);

            // Filter the chart data based on the calculated start date and selected date range.
            const result = chartData.filter((item) => {
                const itemDate = new Date(item.date);
                const isWithinTimeRange = timeRange === "forever" || itemDate >= startDate;
                const isWithinDateRange = !date || (date.from && date.to && itemDate >= date.from && itemDate <= date.to);
                return isWithinTimeRange && isWithinDateRange;
            });
            
            console.log(`result: ${JSON.stringify(result)}`);
            return result;
        };

        setFilteredData(filterData());
    }, [chartData, timeRange, date]);

    // Function to set query parameters in the URL.
    function setQuery(query: any) {
        console.log(`query: ${JSON.stringify(query)}`);
        const params = new URLSearchParams();
        console.log(`params: ${JSON.stringify(params)}`);

        Object.entries(query).forEach(([key, value]) => {
            params.append(key, value);
        });

        console.log(`params: ${JSON.stringify(params)}`);

        router.push(`?${params.toString()}`);
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
                                    params.IntervaleQueryMinutes = newValue;
                                    setQuery(params);
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
                        <PopoverContent className="w-full p-0">
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
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <LineChart accessibilityLayer data={filteredData} margin={{left: 12, right: 12}}>
                        <CartesianGrid vertical={false} />
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
                                dot={{fill: chartConfig[key].color}}
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
