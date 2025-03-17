"use client";

import * as React from "react";
import { Line, LineChart, LabelList, CartesianGrid, XAxis } from "recharts";

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
    ChartConfig as ConfigType, ChartDatas
} from "@/lib/transform";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";
import {useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Check, ChevronsUpDown} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import { useRouter } from "next/navigation";
// import logger from "@/lib/docs/logger";

interface ChartCanvasProps {
    chartData: ChartDatas;
    config: ConfigType;
    preset: any;
    params: any;
}

export function ChartCanvas({ chartData, config, preset, params }: ChartCanvasProps) {
    // log the chartData, config, preset and params
    // logger.debug(`chartData: ${JSON.stringify(chartData)}`);
    // logger.debug(`config: ${JSON.stringify(config)}`);
    // logger.debug(`preset: ${JSON.stringify(preset)}`);
    // logger.debug(`params: ${JSON.stringify(params)}`);
    
    const chartConfig = config satisfies ChartConfig;

    const [timeRange, setTimeRange] = React.useState("90d");
    const [filteredData, setFilteredData] = React.useState(chartData);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string>("");
    const router = useRouter()

    React.useEffect(() => {
        const filterData = () => {
            // logger.debug(`filterData: ${JSON.stringify(filterData)}`);
            // logger.debug(`timeRange: ${JSON.stringify(timeRange)}`);
            
            if (timeRange === "forever") {
                return chartData;
            }
            
            const referenceDate = new Date();
            // logger.debug(`referenceDate: ${JSON.stringify(referenceDate)}`);
            
            // remove d from timeRange to get the number of days to subtract
            const daysToSubtract = parseInt(timeRange.replace("d", ""));
            // logger.debug(`daysToSubtract: ${JSON.stringify(daysToSubtract)}`);

            const startDate = new Date(referenceDate);
            // logger.debug(`startDate: ${JSON.stringify(startDate)}`);
            startDate.setDate(startDate.getDate() - daysToSubtract);

            const result = chartData.filter((item) => {
                const date = new Date(item.date);
                return date >= startDate;
            });
            
            // logger.debug(`result: ${JSON.stringify(result)}`);
            return result;
        };

        setFilteredData(filterData());
    }, [chartData, timeRange]);

    function setQuery(query: any) {
        // logger.debug(`query: ${JSON.stringify(query)}`);
        const params = new URLSearchParams();
        // logger.debug(`params: ${JSON.stringify(params)}`);

        Object.entries(query).forEach(([key, value]) => {
            params.append(key, value);
        });

        // logger.debug(`params: ${JSON.stringify(params)}`);

        router.push(`?${params.toString()}`);
    }

    return (
        <Card>
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle>Area Chart - Interactive</CardTitle>
                    <CardDescription>
                        {params.DescriptionQuery ? params.DescriptionQuery : "No description available."}
                    </CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto" aria-label="Select a value">
                        <SelectValue placeholder="Last 3 months" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="forever" className="rounded-lg">Forever</SelectItem>
                        <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
                        <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
                        <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
                    </SelectContent>
                </Select>
                {preset.map((query: { NameQuery: string }, index: React.Key | undefined) => (
                    <Popover key={index} open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-[20%] justify-between overflow-clip"
                            >
                                {value ? query.NameQuery : (params.NameQuery ? params.NameQuery : "Select preset...")}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                <CommandInput placeholder="Search preset..." />
                                <CommandList>
                                    <CommandEmpty>No query found.</CommandEmpty>
                                    <CommandGroup>
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
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                ))}
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
                                activeDot={{r: 6}}
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
            </CardContent>
        </Card>
    );
}
