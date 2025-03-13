import { Capteur } from './Capteur';

// SiteHasCapteur Response Model
export interface SiteHasCapteur {
    IdSite: string;
    Commentaire: string;
    CreatedAt: string;
    UpdatedAt: string;
    Capteurs: Capteur[];
}
