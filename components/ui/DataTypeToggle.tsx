// components/DataTypeToggle.tsx
import * as React from "react";

interface DataTypeToggleProps {
    selectedDataType: string;
    onChange: (dataType: string) => void;
}

const DataTypeToggle: React.FC<DataTypeToggleProps> = ({ selectedDataType, onChange }) => {
    return (
        <div className="mb-4">
            <div className="flex gap-6">
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="dataType"
                        value="weather"
                        checked={selectedDataType === "weather"}
                        onChange={() => onChange("weather")}
                    />
                    Weather Data
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="dataType"
                        value="climate"
                        checked={selectedDataType === "climate"}
                        onChange={() => onChange("climate")}
                    />
                    Climate Data
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="dataType"
                        value="airQuality"
                        checked={selectedDataType === "airQuality"}
                        onChange={() => onChange("airQuality")}
                    />
                    Air Quality
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="dataType"
                        value="flood"
                        checked={selectedDataType === "flood"}
                        onChange={() => onChange("flood")}
                    />
                    Flood
                </label>
            </div>
        </div>
    );
};

export default DataTypeToggle;
