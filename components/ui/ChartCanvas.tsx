"use client";

import * as React from "react";
import {CartesianGrid, Line, LineChart, XAxis} from "recharts";

import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "./card";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "./chart";

interface ChartCanvasProps {
    chartData: Array<any>;
    dataType: string;
}

export function ChartCanvas({chartData, dataType}: ChartCanvasProps) {
    console.log(chartData);
    const [activeChart, setActiveChart] = React.useState<string>("temperature_2m_mean");
    const [selectedModels, setSelectedModels] = React.useState<string[]>([]); // Use array for multiple models
    const [startDate, setStartDate] = React.useState<string | null>(null);
    const [endDate, setEndDate] = React.useState<string | null>(null);

    // Generate chartKeys dynamically
    const chartKeys = Object.keys(chartData[0] || {}).filter((key) => !key.includes("date"));

    // Create a chartConfig with random colors for each model within each key
    const chartConfig = chartKeys.reduce((config: any, key: string) => {
        config[key] = {
            label: key.charAt(0).toUpperCase() + key.slice(1),
            colors: Array(7).fill(0).map(() => `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`),
        };
        return config;
    }, {}) satisfies ChartConfig;

    // Get available time periods from the chart data (assuming date format is YYYY-MM-DD)
    const timePeriods = chartData.map((entry) => entry.date).filter((value, index, self) => self.indexOf(value) === index);

    // Get available models from the chart data
    const models = chartData[0]?.[activeChart]?.map((modelData: any) => modelData.model) || [];

    // Filter chartData based on selected models and time range
    const filteredChartData = chartData.filter((entry) => {
        const modelMatch = selectedModels.length > 0
            ? entry[activeChart]?.some((modelData: any) => selectedModels.includes(modelData.model))
            : true;

        const date = new Date(entry.date);
        const startDateMatch = startDate ? date >= new Date(startDate) : true;
        const endDateMatch = endDate ? date <= new Date(endDate) : true;

        return modelMatch && startDateMatch && endDateMatch;
    });

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>Line Chart - Interactive</CardTitle>
                    <CardDescription>Showing total temperature data</CardDescription>
                </div>
                <div className="flex">
                    {Object.keys(chartConfig).map((key) => (
                        <button
                            key={key}
                            data-active={activeChart === key}
                            className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                            onClick={() => setActiveChart(key)}
                        >
                            <span className="text-xs text-muted-foreground">{chartConfig[key].label}</span>
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                    <LineChart data={filteredChartData} margin={{left: 12, right: 12}}>
                        <CartesianGrid vertical={false}/>
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString("en-US", {year: "numeric", month: "short"});
                            }}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey={activeChart}
                                    labelFormatter={(model: string) => model}
                                />
                            }
                        />
                        {/* if dataType is Climate then show this */}
                        {filteredChartData[0]?.[activeChart]?.map((modelData: any, index: number) => {
                            // Only render the selected models
                            if (selectedModels.length > 0 && !selectedModels.includes(modelData.model)) {
                                return null;
                            }

                            return (
                                <Line
                                    key={index}
                                    dataKey={`${activeChart}.${index}.value`}
                                    type="monotone"
                                    stroke={chartConfig[activeChart].colors[index]}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            );
                        })}
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
