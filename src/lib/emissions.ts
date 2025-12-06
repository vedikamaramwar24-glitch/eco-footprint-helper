// Emission factors in kg CO2 per unit
export const FUEL_EMISSION_FACTORS: Record<string, { factor: number; unit: string; label: string }> = {
  petrol: { factor: 2.31, unit: "liters", label: "Petrol" },
  diesel: { factor: 2.68, unit: "liters", label: "Diesel" },
  cng: { factor: 2.0, unit: "kg", label: "CNG (Compressed Natural Gas)" },
  lpg: { factor: 1.51, unit: "liters", label: "LPG (Liquefied Petroleum Gas)" },
  coal: { factor: 2.42, unit: "kg", label: "Coal" },
};

// Average electricity emission factor (kg CO2 per kWh)
export const ELECTRICITY_EMISSION_FACTOR = 0.5;

// Waste emission factor (kg CO2 per kg of waste)
export const WASTE_EMISSION_FACTOR = 0.5;

export interface EmissionResult {
  fuel: number;
  electricity: number;
  waste: number;
  total: number;
  highestCategory: "fuel" | "electricity" | "waste";
}

export const calculateEmissions = (
  fuelType: string,
  fuelAmount: number,
  electricityKwh: number,
  wasteKg: number
): EmissionResult => {
  const fuelFactor = FUEL_EMISSION_FACTORS[fuelType]?.factor || 0;
  const fuelEmission = fuelAmount * fuelFactor;
  const electricityEmission = electricityKwh * ELECTRICITY_EMISSION_FACTOR;
  const wasteEmission = wasteKg * WASTE_EMISSION_FACTOR;
  const total = fuelEmission + electricityEmission + wasteEmission;

  let highestCategory: "fuel" | "electricity" | "waste" = "fuel";
  if (electricityEmission > fuelEmission && electricityEmission > wasteEmission) {
    highestCategory = "electricity";
  } else if (wasteEmission > fuelEmission && wasteEmission > electricityEmission) {
    highestCategory = "waste";
  }

  return {
    fuel: fuelEmission,
    electricity: electricityEmission,
    waste: wasteEmission,
    total,
    highestCategory,
  };
};

export const getSavingTips = (category: "fuel" | "electricity" | "waste"): string[] => {
  const tips: Record<string, string[]> = {
    fuel: [
      "Consider switching to public transportation or carpooling",
      "Maintain your vehicle regularly for better fuel efficiency",
      "Plan your trips to reduce unnecessary driving",
      "Consider switching to an electric or hybrid vehicle",
      "Walk or cycle for short distances",
    ],
    electricity: [
      "Switch to LED bulbs - they use 75% less energy",
      "Unplug devices when not in use to avoid phantom loads",
      "Use natural light during the day",
      "Set your AC to 24-26°C for optimal efficiency",
      "Consider installing solar panels",
    ],
    waste: [
      "Start composting organic waste at home",
      "Reduce single-use plastic consumption",
      "Recycle paper, glass, and metal properly",
      "Buy products with minimal packaging",
      "Donate or repurpose items instead of throwing them away",
    ],
  };

  return tips[category] || [];
};
