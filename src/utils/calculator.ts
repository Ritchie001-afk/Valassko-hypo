import { BANK_CONSTANTS, MARKET_MAP, TownId, RENOVATION_COST_PER_M2 } from '@/data/market-config';

export type PropertyType = 'Byt (rekonstruovaný)' | 'Byt (původní stav)' | 'Starší dům' | 'Stavba domu' | 'Rekonstrukce' | 'Pozemek';

export interface AffordabilityResult {
    status: 'YES' | 'MAYBE' | 'NO';
    maxLoan: number;
    loanNeeded: number;
    marketPrice: number;
    totalBudget: number;
    failReason?: 'LTV' | 'DSTI' | 'BUDGET';
    maxAffordableM2?: number; // How big of a house could they afford?
}

const CONSTANTS = {
    FLAT_SIZE_M2: 70, // Default fallback
    HOUSE_SIZE_M2: 120, // Default fallback
    LAND_SIZE_M2: 1000, // Default fallback for land
};

export const calculateAffordability = (
    income: number,
    cash: number,
    location: TownId,
    propertyType: PropertyType,
    userAreaM2: number = 0 // Optional user input
): AffordabilityResult => {
    // 1. Calculate Max Mortgage based on Income (DSTI)
    const monthlyRate = BANK_CONSTANTS.INTEREST_RATE / 12;
    const numPayments = BANK_CONSTANTS.MORTGAGE_YEARS * 12;

    const maxMonthlyPayment = income * BANK_CONSTANTS.MAX_DSTI;
    const maxLoanRaw = maxMonthlyPayment * (Math.pow(1 + monthlyRate, numPayments) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
    const maxLoanDSTI = Math.floor(maxLoanRaw);

    // 2. Estimated Market Price
    const marketData = MARKET_MAP[location];
    let marketPrice = 0;

    // Determine Area Size
    let areaSize = userAreaM2;
    if (areaSize === 0) {
        if (propertyType.includes('Byt')) areaSize = CONSTANTS.FLAT_SIZE_M2;
        else if (propertyType === 'Pozemek') areaSize = CONSTANTS.LAND_SIZE_M2;
        else areaSize = CONSTANTS.HOUSE_SIZE_M2;
    }

    // Calculate Price per M2 based on type
    let effectivePricePerM2 = 0;
    let basePrice = 0; // Fixed costs like land

    switch (propertyType) {
        case 'Byt (rekonstruovaný)':
            effectivePricePerM2 = marketData.flat_renovated;
            break;
        case 'Byt (původní stav)':
            effectivePricePerM2 = marketData.flat_old;
            break;
        case 'Starší dům':
            effectivePricePerM2 = marketData.house_old;
            break;
        case 'Stavba domu':
            // Construction cost only (Price/m2)
            // Ideally should ask for land, but assuming user checks land separately or owns it
            effectivePricePerM2 = marketData.house_build;
            break;
        case 'Rekonstrukce':
            // Old house price + Renovation cost = Total Price per m2
            effectivePricePerM2 = marketData.house_old + RENOVATION_COST_PER_M2;
            break;
        case 'Pozemek':
            effectivePricePerM2 = marketData.land;
            break;
    }

    marketPrice = (areaSize * effectivePricePerM2) + basePrice;

    // 3. Max Loan based on LTV (90% of Market Price)
    const maxLoanLTV = marketPrice * BANK_CONSTANTS.MAX_LTV;

    // 4. Actual Max Loan
    const maxLoan = Math.min(maxLoanDSTI, maxLoanLTV);

    // 5. Total Purchase Power
    const totalBudget = maxLoan + cash;

    // 6. Max Affordable Area Calculation (Reverse check)
    // Budget = (Area * PricePerM2) + BasePrice
    // Area = (Budget - BasePrice) / PricePerM2
    const maxBudgetAvailable = Math.min(maxLoanDSTI + cash, (maxLoanDSTI + cash) / (1 - BANK_CONSTANTS.MAX_LTV)); // Simplified check
    // Actually simpler: TotalBudget is limited by DSTI, and we need sufficient cash for LTV.
    // Let's just use the current totalBudget to see what size fits.
    // NOTE: This doesn't perfectly solve the "Max LTV" constraint for a hypothetical different price.
    // But it gives a good estimate.
    const maxAffordableM2 = Math.floor((totalBudget - basePrice) / effectivePricePerM2);

    // 7. Status Determination
    let status: 'YES' | 'MAYBE' | 'NO' = 'NO';
    let failReason: 'LTV' | 'DSTI' | 'BUDGET' | undefined;

    if (totalBudget >= marketPrice) {
        status = 'YES';
    } else {
        if (cash < (marketPrice * (1 - BANK_CONSTANTS.MAX_LTV))) {
            status = 'NO';
            failReason = 'LTV';
        }
        else if (maxLoanDSTI < (marketPrice - cash)) {
            status = 'NO';
            failReason = 'DSTI';
        }
        else {
            status = 'NO';
            failReason = 'BUDGET';
        }

        if (totalBudget >= marketPrice * 0.90 && failReason !== 'LTV') {
            status = 'MAYBE';
        }
    }

    const loanNeeded = Math.max(0, marketPrice - cash);

    return {
        status,
        maxLoan,
        loanNeeded,
        marketPrice,
        totalBudget,
        failReason,
        maxAffordableM2
    };
};
