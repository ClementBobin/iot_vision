"use server";

import { unstable_cacheLife as cacheLife } from 'next/cache';
import { 
    ApiResponse, 
    SiteHasCapteurSearchParams, 
    ReleverCapteurSearchParams, 
    StatsSearchParams, 
    SiteHasCapteur, 
    Capteur, 
    Stats, 
    CapteurType 
} from './model';
import { UUID } from 'node:crypto';

const API_BASE_URL = "https://api.example.com";

// Search SiteHasCapteur
export const searchSiteHasCapteur = async (params: SiteHasCapteurSearchParams): Promise<ApiResponse<SiteHasCapteur>> => {
    try {
        const query = new URLSearchParams(params as Record<string, string>).toString();
        const res = await fetch(`${API_BASE_URL}/api/sitehascapteurs/search?${query}`, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error('Failed to search SiteHasCapteur');

        return await res.json();
    } catch (error) {
        console.error('Error fetching SiteHasCapteur:', error);
        throw error;
    }
};

// Search ReleverCapteur
export const searchReleverCapteur = async (params: ReleverCapteurSearchParams): Promise<ApiResponse<Capteur>> => {
    try {
        const query = new URLSearchParams(params as Record<string, string>).toString();
        const res = await fetch(`${API_BASE_URL}/api/relevercapteurs/search?${query}`, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error('Failed to search ReleverCapteur');

        return await res.json();
    } catch (error) {
        console.error('Error fetching ReleverCapteur:', error);
        throw error;
    }
};

// Search Stats
export const searchStats = async (params: StatsSearchParams): Promise<ApiResponse<Stats>> => {
    "use cache";
    cacheLife('hours');

    try {
        const query = new URLSearchParams(params as Record<string, string>).toString();
        const res = await fetch(`${API_BASE_URL}/api/stats?${query}`, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error('Failed to search stats');

        return await res.json();
    } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
    }
};

// Get Sites
export const fetchSites = async (Id? : UUID): Promise<ApiResponse<SiteHasCapteur>> => {
    "use cache";
    cacheLife('days');

    try {
        const url = Id ? `${API_BASE_URL}/api/sites/${Id}` : `${API_BASE_URL}/api/sites`;
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error('Failed to fetch sites');

        return await res.json();
    } catch (error) {
        console.error('Error fetching sites:', error);
        throw error;
    }
};

// Get Capteur Types
export const fetchCapteurTypes = async (Id? : UUID): Promise<ApiResponse<CapteurType>> => {
    "use cache";
    cacheLife('days');

    try {
        const url = Id ? `${API_BASE_URL}/api/CapteurTypes/${Id}` : `${API_BASE_URL}/api/CapteurTypes`;
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error('Failed to fetch capteur types');

        return await res.json();
    } catch (error) {
        console.error('Error fetching capteur types:', error);
        throw error;
    }
};

// Get Capteurs
export const fetchCapteurs = async (Id? : string): Promise<ApiResponse<Capteur>> => {
    "use cache";
    cacheLife('days');

    try {
        const url = Id ? `${API_BASE_URL}/api/capteurs/${Id}` : `${API_BASE_URL}/api/capteurs`;
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error('Failed to fetch capteurs');

        return await res.json();
    } catch (error) {
        console.error('Error fetching capteurs:', error);
        throw error;
    }
};
