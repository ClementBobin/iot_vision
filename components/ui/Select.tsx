"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DataTypeToggle from "./DataTypeToggle"; // Import the new DataTypeToggle component

interface SelectProps {
    initialDataType: string;
    initialSelectedModels: string[];
    initialStartDate: string | null;
    initialEndDate: string | null;
    initialSelectedCategoryTypes: string[];
    CategoryTypes: string[];
    initialLatitude: string | null;
    initialLongitude: string | null;
}

const fieldsClimate = [
    "temperature_2m_mean", "temperature_2m_max", "temperature_2m_min",
    "wind_speed_10m_mean", "wind_speed_10m_max", "cloud_cover_mean",
    "shortwave_radiation_sum", "relative_humidity_2m_mean", "relative_humidity_2m_max",
    "relative_humidity_2m_min", "dew_point_2m_mean", "dew_point_2m_min",
    "dew_point_2m_max", "precipitation_sum", "rain_sum", "snowfall_sum",
    "pressure_msl_mean", "soil_moisture_0_to_10cm_mean", "et0_fao_evapotranspiration_sum"
];

const modelsClimate = [
    "CMCC_CM2_VHR4","FGOALS_f3_H","HiRAM_SIT_HR","MRI_AGCM3_2_S","EC_Earth3P_HR","MPI_ESM1_2_XR","NICAM16_8S"
];

const fieldsAirQuality = [
    "pm10", "pm2_5", "carbon_monoxide", "carbon_dioxide", "nitrogen_dioxide",
    "sulphur_dioxide", "ozone", "aerosol_optical_depth", "dust", "uv_index",
    "uv_index_clear_sky", "ammonia", "methane", "alder_pollen", "birch_pollen",
    "grass_pollen", "mugwort_pollen", "olive_pollen", "ragweed_pollen"
];

const fieldsFlood = [
    "river_discharge", "river_discharge_mean", "river_discharge_median",
    "river_discharge_max", "river_discharge_min", "river_discharge_p25",
    "river_discharge_p75"
];

export default function Select({
                                   initialDataType,
                                   initialSelectedModels,
                                   initialStartDate,
                                   initialEndDate,
                                   initialSelectedCategoryTypes,
                                   CategoryTypes,
                                   initialLatitude,
                                   initialLongitude
                               }: SelectProps) {
    const [selectedModels, setSelectedModels] = useState<string[]>(Array.isArray(initialSelectedModels) ? initialSelectedModels : []);
    const [startDate, setStartDate] = useState<string | null>(initialStartDate);
    const [endDate, setEndDate] = useState<string | null>(initialEndDate);
    const [selectedCategoryTypes, setSelectedCategoryTypes] = useState<string[]>(Array.isArray(initialSelectedCategoryTypes) ? initialSelectedCategoryTypes : []);
    const [cityInput, setCityInput] = useState<string>("");
    const [cityResults, setCityResults] = useState<{ id: number; name: string }[]>([]);
    const [dataType, setDataType] = useState<string>(initialDataType || "weather"); // state for data type
    const [latitude, setLatitude] = useState<string | null>(initialLatitude);
    const [longitude, setLongitude] = useState<string | null>(initialLongitude);
    const router = useRouter()
    

    useEffect(() => {
        const params = new URLSearchParams();

        if (selectedModels.length > 0) {
            params.set("selectedModels", selectedModels.join(","));
        }

        if (selectedCategoryTypes.length > 0) {
            params.set("selectedCategoryTypes", selectedCategoryTypes.join(","));
        }

        if (startDate) {
            params.set("startDate", startDate);
        }

        if (endDate) {
            params.set("endDate", endDate);
        }
        
        if (latitude) {
            params.set("latitude", latitude);
        }
        
        if (longitude) {
            params.set("longitude", longitude);
        }

        params.set("dataType", dataType); // Add dataType to URL parameters

        router.push(`?${params.toString()}`);
    }, [selectedModels, startDate, endDate, router, selectedCategoryTypes, dataType, latitude, longitude]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get("dataType") !== dataType) {
            const newParams = new URLSearchParams();

            if (startDate) {
                newParams.set("startDate", startDate);
            }

            if (endDate) {
                newParams.set("endDate", endDate);
            }

            if (params.get("latitude")) {
                newParams.set("latitude", params.get("latitude")!);
            }

            if (params.get("longitude")) {
                newParams.set("longitude", params.get("longitude")!);
            }
            
            if (params.get("selectedModels")) {
                if (params.get("DataType") !== "climate") {
                    newParams.set("selectedModels", params.get("selectedModels")!);
                } else {
                    newParams.delete("selectedModels");
                }
            }

            newParams.set("dataType", dataType);

            router.push(`?${newParams.toString()}`);
        }
    }, [dataType, startDate, endDate, router, latitude, longitude]);

    const handleModelChange = (model: string) => {
        const newSelectedModels = selectedModels.includes(model)
            ? selectedModels.filter((m) => m !== model)
            : [...selectedModels, model];
        setSelectedModels(newSelectedModels);
    };

    const handleCityInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCityInput(value);
        if (value.length > 0) {
            try {
                const res = await fetch(`/api/cities?action=search&city=${value}`);
                if (!res.ok) throw new Error("Failed to fetch city search results");
                const results = await res.json();
                setCityResults(results);
            } catch (error) {
                console.error("Error fetching city results:", error);
            }
        } else {
            setCityResults([]);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-row justify-between gap-1 px-6 py-5 sm:py-6">
                    <div className="flex flex-col">
                        <CardTitle>Select Weather Data</CardTitle>
                        <CardDescription>Select Params</CardDescription>
                    </div>
                    {/* Use the new DataTypeToggle component */}
                    <DataTypeToggle selectedDataType={dataType} onChange={setDataType} />
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <form className="flex gap-4 mb-4">
                    {modelsClimate && modelsClimate.length > 0 && dataType === "climate" && (
                        <div>
                            <span className="font-semibold">Select Models:</span>
                            <div className="flex gap-4 flex-wrap">
                                {modelsClimate.map((model, index) => (
                                    <label key={index} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="selectedModels"
                                            value={model}
                                            checked={selectedModels.includes(model)}
                                            onChange={() => handleModelChange(model)}
                                        />
                                        {model}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    {fieldsClimate && fieldsClimate.length > 0 && dataType === "climate" && (
                        <div>
                            <span className="font-semibold">Select Fields:</span>
                            <div className="flex gap-4 flex-wrap">
                                {fieldsClimate.map((field, index) => (
                                    <label key={index} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="selectedCategoryTypes"
                                            value={field}
                                            checked={selectedCategoryTypes.includes(field)}
                                            onChange={() =>
                                                setSelectedCategoryTypes((prev) => {
                                                    return prev.includes(field)
                                                        ? prev.filter((item) => item !== field)
                                                        : [...prev, field];
                                                })
                                            }
                                        />
                                        {field}
                                    </label>
                                ))}
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="selectedCategoryTypes"
                                        value="all"
                                        checked={selectedCategoryTypes.length === fieldsClimate.length}
                                        onChange={() =>
                                            setSelectedCategoryTypes((prev) => {
                                                return prev.length === fieldsClimate.length ? [] : fieldsClimate;
                                            })
                                        }
                                    />
                                    All
                                </label>
                            </div>
                        </div>
                    )}
                    {CategoryTypes && CategoryTypes.length > 0 && dataType === "weather" && (
                        <div>
                            <span className="font-semibold">Select Category Types:</span>
                            <div className="flex gap-4 flex-wrap">
                                {CategoryTypes.map((category, index) => (
                                    <label key={index} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="selectedCategoryTypes"
                                            value={category}
                                            checked={selectedCategoryTypes.includes(category)}
                                            onChange={() =>
                                                setSelectedCategoryTypes((prev) => {
                                                    return prev.includes(category)
                                                        ? prev.filter((item) => item !== category)
                                                        : [...prev, category];
                                                })
                                            }
                                        />
                                        {category}
                                    </label>
                                ))}
                                <label className="flex items-center gap-2">
                                    {/*    button to add all category in params */}
                                    <input
                                        type="checkbox"
                                        name="selectedCategoryTypes"
                                        value="all"
                                        checked={selectedCategoryTypes.length === CategoryTypes.length}
                                        onChange={() =>
                                            setSelectedCategoryTypes((prev) => {
                                                return prev.length === CategoryTypes.length ? [] : CategoryTypes;
                                            })
                                        }
                                    />
                                    All
                                </label>
                            </div>
                        </div>
                    )}
                    {fieldsAirQuality && fieldsAirQuality.length > 0 && dataType === "airQuality" && (
                        <div>
                            <span className="font-semibold">Select Fields:</span>
                            <div className="flex gap-4 flex-wrap">
                                {fieldsAirQuality.map((field, index) => (
                                    <label key={index} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="selectedCategoryTypes"
                                            value={field}
                                            checked={selectedCategoryTypes.includes(field)}
                                            onChange={() =>
                                                setSelectedCategoryTypes((prev) => {
                                                    return prev.includes(field)
                                                        ? prev.filter((item) => item !== field)
                                                        : [...prev, field];
                                                })
                                            }
                                        />
                                        {field}
                                    </label>
                                ))}
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="selectedCategoryTypes"
                                        value="all"
                                        checked={selectedCategoryTypes.length === fieldsAirQuality.length}
                                        onChange={() =>
                                            setSelectedCategoryTypes((prev) => {
                                                return prev.length === fieldsAirQuality.length ? [] : fieldsAirQuality;
                                            })
                                        }
                                    />
                                    All
                                </label>
                            </div>
                        </div>
                    )}
                    {fieldsFlood && fieldsFlood.length > 0 && dataType === "flood" && (
                        <div>
                            <span className="font-semibold">Select Fields:</span>
                            <div className="flex gap-4 flex-wrap">
                                {fieldsFlood.map((field, index) => (
                                    <label key={index} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="selectedCategoryTypes"
                                            value={field}
                                            checked={selectedCategoryTypes.includes(field)}
                                            onChange={() =>
                                                setSelectedCategoryTypes((prev) => {
                                                    return prev.includes(field)
                                                        ? prev.filter((item) => item !== field)
                                                        : [...prev, field];
                                                })
                                            }
                                        />
                                        {field}
                                    </label>
                                ))}
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="selectedCategoryTypes"
                                        value="all"
                                        checked={selectedCategoryTypes.length === fieldsFlood.length}
                                        onChange={() =>
                                            setSelectedCategoryTypes((prev) => {
                                                return prev.length === fieldsFlood.length ? [] : fieldsFlood;
                                            })
                                        }
                                    />
                                    All
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col justify-center gap-4">
                        {cityResults.length > 0 && (
                            <ul className="border border-gray-300 rounded-md shadow-md">
                                {cityResults.map((city) => (
                                    <li
                                        key={city.id}
                                        className="p-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={async () => {
                                            setCityInput(city.name);
                                            setCityResults([]);
                                            try {
                                                const res = await fetch(`/api/cities?action=fetch&city=${city.name}`);
                                                if (!res.ok) throw new Error("Failed to fetch city coordinates");
                                                const { latitude, longitude } = await res.json();
                                                console.log("City coordinates:", latitude, longitude);
                                                setLatitude(latitude);
                                                setLongitude(longitude);
                                            } catch (error) {
                                                console.error("Error fetching city coordinates:", error);
                                            }
                                        }}
                                    >
                                        {city.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <input
                            type="text"
                            placeholder="Enter city"
                            value={cityInput}
                            onChange={handleCityInputChange}
                        />

                        <div className="flex gap-4">
                            <input
                                type="date"
                                name="startDate"
                                value={startDate || ""}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <input
                                type="date"
                                name="endDate"
                                value={endDate || ""}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}