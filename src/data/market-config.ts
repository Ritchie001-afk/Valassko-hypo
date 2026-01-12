export const BANK_CONSTANTS = {
  INTEREST_RATE: 0.048, // 4.8%
  MAX_DSTI: 0.45,       // 45% (Monthly Payment / Net Income)
  MAX_LTV: 0.90,        // 90% (Loan to Value)
  MORTGAGE_YEARS: 30,
};

// 1. Define all specific locations (TownId)
export type TownId =
  // Rožnovsko
  | 'Rožnov p.R.' | 'Vigantice' | 'Hutisko-Solanec' | 'Dolní Bečva' | 'Prostřední Bečva' | 'Horní Bečva' | 'Zubří' | 'Vidče'
  // Vsetínsko
  | 'Vsetín' | 'Ústí' | 'Hovězí' | 'Halenkov' | 'Nový Hrozenkov' | 'Karolinka' | 'Velké Karlovice'
  // Valmez
  | 'Valašské Meziříčí' | 'Zašová' | 'Kelč' | 'Lešná' | 'Jablůnka'
  // Frenštát
  | 'Frenštát p.R.' | 'Trojanovice' | 'Veřovice';

export const REGIONS = {
  'Rožnovsko': ['Rožnov p.R.', 'Vigantice', 'Hutisko-Solanec', 'Dolní Bečva', 'Prostřední Bečva', 'Horní Bečva', 'Zubří', 'Vidče'],
  'Vsetínsko': ['Vsetín', 'Ústí', 'Hovězí', 'Halenkov', 'Nový Hrozenkov', 'Karolinka', 'Velké Karlovice'],
  'Valašskomeziříčsko': ['Valašské Meziříčí', 'Zašová', 'Kelč', 'Lešná', 'Jablůnka'],
  'Frenštátsko': ['Frenštát p.R.', 'Trojanovice', 'Veřovice'],
} as const;

export type RegionId = keyof typeof REGIONS;

export interface MarketPrice {
  flat_renovated: number; // Price per m2 (Byt po rekonstrukci)
  flat_old: number;       // Price per m2 (Byt v původním stavu)
  house_old: number;      // Price per m2 (Starší dům - průměr)
  house_build: number;    // Price per m2 (Novostavba na klíč - bez pozemku)
  land: number;           // Price per m2 (Stavební pozemek)
}

export const RENOVATION_COST_PER_M2 = 25000; // 2025 estimate (kompletní)

// 2025 Estimates based on research (Build ~46k, Land ~2-4k depending on location)
// flat_old is estimated at approx 75-80% of flat_renovated or flat_renovated - 18k-22k
export const MARKET_MAP: Record<TownId, MarketPrice> = {
  // --- ROŽNOVSKO ---
  'Rožnov p.R.': { flat_renovated: 74000, flat_old: 54000, house_old: 45000, house_build: 46000, land: 3500 },
  'Vigantice': { flat_renovated: 55000, flat_old: 38000, house_old: 36000, house_build: 46000, land: 2600 },
  'Hutisko-Solanec': { flat_renovated: 50000, flat_old: 35000, house_old: 35000, house_build: 46000, land: 2400 },
  'Dolní Bečva': { flat_renovated: 60000, flat_old: 42000, house_old: 38000, house_build: 46000, land: 2900 },
  'Prostřední Bečva': { flat_renovated: 58000, flat_old: 40000, house_old: 36000, house_build: 46000, land: 2700 },
  'Horní Bečva': { flat_renovated: 65000, flat_old: 45000, house_old: 42000, house_build: 48000, land: 2800 },
  'Zubří': { flat_renovated: 55000, flat_old: 38000, house_old: 36000, house_build: 46000, land: 2200 },
  'Vidče': { flat_renovated: 45000, flat_old: 32000, house_old: 33000, house_build: 46000, land: 2000 },

  // --- VSETÍNSKO ---
  'Vsetín': { flat_renovated: 61000, flat_old: 43000, house_old: 38000, house_build: 46000, land: 2800 },
  'Ústí': { flat_renovated: 40000, flat_old: 28000, house_old: 28000, house_build: 46000, land: 1600 },
  'Hovězí': { flat_renovated: 42000, flat_old: 29000, house_old: 30000, house_build: 46000, land: 1800 },
  'Halenkov': { flat_renovated: 42000, flat_old: 29000, house_old: 29000, house_build: 46000, land: 1600 },
  'Nový Hrozenkov': { flat_renovated: 40000, flat_old: 28000, house_old: 28000, house_build: 46000, land: 1500 },
  'Karolinka': { flat_renovated: 38000, flat_old: 26000, house_old: 27000, house_build: 46000, land: 1400 },
  'Velké Karlovice': { flat_renovated: 85000, flat_old: 62000, house_old: 55000, house_build: 52000, land: 4200 },

  // --- VALMEZ ---
  'Valašské Meziříčí': { flat_renovated: 52000, flat_old: 36000, house_old: 36000, house_build: 46000, land: 2400 },
  'Zašová': { flat_renovated: 48000, flat_old: 33000, house_old: 34000, house_build: 46000, land: 2000 },
  'Kelč': { flat_renovated: 38000, flat_old: 26000, house_old: 29000, house_build: 46000, land: 1400 },
  'Lešná': { flat_renovated: 38000, flat_old: 26000, house_old: 29000, house_build: 46000, land: 1400 },
  'Jablůnka': { flat_renovated: 40000, flat_old: 28000, house_old: 30000, house_build: 46000, land: 1500 },

  // --- FRENŠTÁTSKO ---
  'Frenštát p.R.': { flat_renovated: 54000, flat_old: 38000, house_old: 39000, house_build: 46000, land: 3200 },
  'Trojanovice': { flat_renovated: 65000, flat_old: 46000, house_old: 48000, house_build: 48000, land: 3600 },
  'Veřovice': { flat_renovated: 45000, flat_old: 31000, house_old: 32000, house_build: 46000, land: 1900 },
};
