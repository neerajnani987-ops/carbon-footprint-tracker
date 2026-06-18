import { CalculatorState } from '../types';
import { COEFFS } from '../constants';

/**
 * Sanitizes input text to prevent XSS and malicious HTML injections
 */
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates and clamps calculator inputs to prevent unrealistic values or negative submissions
 */
export const validateCalculatorState = (state: Partial<CalculatorState>): Partial<CalculatorState> => {
  const validated: Partial<CalculatorState> = {};

  if (state.vehicleType !== undefined) {
    const validTypes = ['none', 'petrol', 'diesel', 'hybrid', 'ev', 'motorbike'];
    validated.vehicleType = validTypes.includes(state.vehicleType) ? state.vehicleType : 'none';
  }

  if (state.vehicleMiles !== undefined) {
    validated.vehicleMiles = Math.max(0, Math.min(1000, Number(state.vehicleMiles) || 0));
  }

  if (state.flightsShort !== undefined) {
    validated.flightsShort = Math.max(0, Math.min(100, Number(state.flightsShort) || 0));
  }

  if (state.flightsLong !== undefined) {
    validated.flightsLong = Math.max(0, Math.min(100, Number(state.flightsLong) || 0));
  }

  if (state.electricBill !== undefined) {
    validated.electricBill = Math.max(0, Math.min(2000, Number(state.electricBill) || 0));
  }

  if (state.gasBill !== undefined) {
    validated.gasBill = Math.max(0, Math.min(2000, Number(state.gasBill) || 0));
  }

  if (state.cleanEnergyShare !== undefined) {
    validated.cleanEnergyShare = Math.max(0, Math.min(100, Number(state.cleanEnergyShare) || 0));
  }

  if (state.dietType !== undefined) {
    const validDiets = ['heavy-meat', 'moderate-meat', 'low-meat', 'vegetarian', 'vegan'];
    validated.dietType = validDiets.includes(state.dietType) ? state.dietType : 'moderate-meat';
  }

  if (state.localFoodShare !== undefined) {
    validated.localFoodShare = Math.max(0, Math.min(100, Number(state.localFoodShare) || 0));
  }

  if (state.wasteBags !== undefined) {
    validated.wasteBags = Math.max(0, Math.min(50, Number(state.wasteBags) || 0));
  }

  if (state.recyclingRate !== undefined) {
    validated.recyclingRate = Math.max(0, Math.min(100, Number(state.recyclingRate) || 0));
  }

  return validated;
};

/**
 * Calculates annual carbon footprint (in metric tons of CO2e) per category
 */
export const calculateCarbonBreakdown = (calculator: CalculatorState) => {
  // 1. Transportation Annual Carbon (Tons)
  let transportCo2 = 0;
  if (calculator.vehicleType !== 'none') {
    const annualMiles = calculator.vehicleMiles * 52;
    const coeff = COEFFS.vehicle[calculator.vehicleType] || 0;
    transportCo2 += annualMiles * coeff;
  }
  transportCo2 += calculator.flightsShort * COEFFS.flights.short;
  transportCo2 += calculator.flightsLong * COEFFS.flights.long;
  transportCo2 = transportCo2 / 1000; // convert to tons

  // 2. Home Energy Annual Carbon (Tons)
  const annualKwh = (calculator.electricBill / COEFFS.electric.kwhCost) * 12;
  const standardGridShare = 1 - calculator.cleanEnergyShare / 100;
  const electricCo2 = (annualKwh * standardGridShare * COEFFS.electric.co2PerKwh) / 1000;

  const annualTherms = (calculator.gasBill / COEFFS.gas.thermCost) * 12;
  const gasCo2 = (annualTherms * COEFFS.gas.co2PerTherm) / 1000;
  const energyCo2 = electricCo2 + gasCo2;

  // 3. Diet Annual Carbon (Tons)
  const dietBase = COEFFS.diet[calculator.dietType] || 2.0;
  const dietDiscount = (calculator.localFoodShare / 100) * 0.1;
  const dietCo2 = dietBase * (1 - dietDiscount);

  // 4. Waste Annual Carbon (Tons)
  const wasteBase = calculator.wasteBags * COEFFS.waste.perBag;
  const wasteDiscount = (calculator.recyclingRate / 100) * 0.5;
  const wasteCo2 = wasteBase * (1 - wasteDiscount);

  const total = transportCo2 + energyCo2 + dietCo2 + wasteCo2;

  return {
    transport: parseFloat(transportCo2.toFixed(2)),
    energy: parseFloat(energyCo2.toFixed(2)),
    diet: parseFloat(dietCo2.toFixed(2)),
    waste: parseFloat(wasteCo2.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
};
