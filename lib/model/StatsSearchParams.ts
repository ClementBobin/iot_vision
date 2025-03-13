import { ReleverCapteurSearchParams } from "./ReleverCapteurSearchParams";

// Stats Request Parameters
export interface StatsSearchParams extends ReleverCapteurSearchParams {
    FilterType?: "equal" | "superieur" | "inferieur";
    FilterValue?: number;
    AsPourcentage?: boolean;
}