import { transform, TransformResult } from "./transform";

jest.mock('./docs/logger', () => ({
    debug: jest.fn(),
    warn: jest.fn(),
    logWithErrorHandling: jest.fn(),
}));

describe("transform function", () => {
    it("should return empty chartData and chartConfig when data is empty", async () => {
        const data: any[] = [];
        const result: TransformResult = await transform(data);
        expect(result.chartData).toEqual([]);
        expect(result.chartConfig).toEqual({});
    });

    it("should aggregate data correctly", async () => {
        const data = [
            {
                DevEUI: "device1",
                Data: [
                    { Time: "2023-10-01T10:15:00Z", Value: 10 },
                    { Time: "2023-10-01T10:45:00Z", Value: 20 }
                ]
            },
            {
                DevEUI: "device2",
                Data: [
                    { Time: "2023-10-01T10:20:00Z", Value: 30 },
                    { Time: "2023-10-01T10:50:00Z", Value: 40 }
                ]
            }
        ];
        const result: TransformResult = await transform(data, 30);
        expect(result.chartData).toEqual([
            { date: "2023-10-01T10:00", device1: 10, device2: 30, total: 40 },
            { date: "2023-10-01T10:30", device1: 20, device2: 40, total: 60 }
        ]);
        expect(result.chartConfig).toHaveProperty("device1");
        expect(result.chartConfig).toHaveProperty("device2");
        expect(result.chartConfig).toHaveProperty("total");
    });

    it("should handle missing values by setting them to null", async () => {
        const data = [
            {
                DevEUI: "device1",
                Data: [
                    { Time: "2023-10-01T10:15:00Z", Value: 10 }
                ]
            },
            {
                DevEUI: "device2",
                Data: [
                    { Time: "2023-10-01T10:45:00Z", Value: 20 }
                ]
            }
        ];
        const result: TransformResult = await transform(data, 30);
        expect(result.chartData).toEqual([
            { date: "2023-10-01T10:00", device1: 10, device2: null, total: 10 },
            { date: "2023-10-01T10:30", device1: null, device2: 20, total: 20 }
        ]);
    });

    it("should generate random colors for each device", async () => {
        const data = [
            {
                DevEUI: "device1",
                Data: [
                    { Time: "2023-10-01T10:15:00Z", Value: 10 }
                ]
            }
        ];
        const result: TransformResult = await transform(data, 30);
        expect(result.chartConfig.device1.color).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(result.chartConfig.total.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
});