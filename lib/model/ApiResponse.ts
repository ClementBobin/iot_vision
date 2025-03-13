// Generic API Response
export interface ApiResponse<T> {
    Result?: T;
    Results?: T[];
    Success: boolean;
    Message?: string;
    GenerationTime_ms?: number;
}
