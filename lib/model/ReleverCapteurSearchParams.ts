import { SiteHasCapteurSearchParams } from './SiteHasCapteurSearchParams';

// ReleverCapteur Request Parameters
export interface ReleverCapteurSearchParams extends SiteHasCapteurSearchParams {
    TimeStart?: string; // ISO date string
    TimeEnd?: string; // ISO date string
    LastTimePeriod?: string; // e.g. '1d', '2m', '3y'
}