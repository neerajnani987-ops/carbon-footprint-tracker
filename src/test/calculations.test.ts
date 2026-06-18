import { describe, it, expect } from 'vitest';

const COEFFS = {
  vehicle: { petrol: 0.411, diesel: 0.355, hybrid: 0.220, ev: 0.080, motorbike: 0.180, none: 0.0 } as Record<string, number>,
  flights: { short: 225, long: 820 },
  electric: { kwhCost: 0.15, co2PerKwh: 0.39 },
  gas: { thermCost: 1.0, co2PerTherm: 5.3 },
  diet: { 'heavy-meat': 3.3, 'moderate-meat': 2.5, 'low-meat': 1.7, 'vegetarian': 1.2, 'vegan': 0.9 } as Record<string, number>,
  waste: { perBag: 0.25 },
};

function calculateCarbonBreakdown(calculator: any) {
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
}

describe('Carbon Calculation Math', () => {
  it('correctly calculates carbon breakdown for low-impact eco-conscious profiles', () => {
    const testCalculator = {
      vehicleType: 'ev',
      vehicleMiles: 20,
      flightsShort: 0,
      flightsLong: 0,
      electricBill: 40,
      gasBill: 10,
      cleanEnergyShare: 100, // zero grid emissions
      dietType: 'vegan',
      localFoodShare: 50,
      wasteBags: 1,
      recyclingRate: 100, // cuts waste emissions by 50%
    };

    const breakdown = calculateCarbonBreakdown(testCalculator);

    // Transport: EV (0.08) * 20 * 52 = 83.2 kg = 0.08 tons
    expect(breakdown.transport).toBe(0.08);

    // Energy: electric is 100% clean (0 tons). Gas: $10 / 1.0 * 12 * 5.3 = 636 kg = 0.64 tons. Total energy = 0.64 tons
    expect(breakdown.energy).toBe(0.64);

    // Diet: vegan base 0.9 tons. Local food 50% discount = 5%. 0.9 * 0.95 = 0.855 -> 0.85 tons.
    expect(breakdown.diet).toBe(0.85);

    // Waste: 1 bag * 0.25 = 0.25 tons. Recycling 100% discount = 50%. 0.25 * 0.5 = 0.13 tons.
    expect(breakdown.waste).toBe(0.13);

    expect(breakdown.total).toBe(1.70); // 0.08 + 0.64 + 0.85 + 0.13
  });

  it('correctly calculates carbon breakdown for high-impact profiles', () => {
    const testCalculator = {
      vehicleType: 'petrol',
      vehicleMiles: 150,
      flightsShort: 4,
      flightsLong: 2,
      electricBill: 150,
      gasBill: 80,
      cleanEnergyShare: 10,
      dietType: 'heavy-meat',
      localFoodShare: 10,
      wasteBags: 4,
      recyclingRate: 20,
    };

    const breakdown = calculateCarbonBreakdown(testCalculator);

    // Transport: Petrol (0.411) * 150 * 52 = 3205.8 kg + short flights (4 * 225 = 900kg) + long flights (2 * 820 = 1640kg) = 5745.8 kg = 5.75 tons
    expect(breakdown.transport).toBe(5.75);

    // Energy:
    // Electric: $150 / 0.15 * 12 = 12000 kWh. Clean energy 10% -> 90% grid share. 12000 * 0.9 * 0.39 = 4212 kg = 4.212 tons.
    // Gas: $80 / 1.0 * 12 * 5.3 = 5088 kg = 5.088 tons.
    // Total energy = 4.212 + 5.088 = 9.30 tons.
    expect(breakdown.energy).toBe(9.3);

    // Diet: heavy-meat 3.3 tons. Local food 10% discount = 1%. 3.3 * 0.99 = 3.27 tons.
    expect(breakdown.diet).toBe(3.27);

    // Waste: 4 bags * 0.25 = 1.0 tons. Recycling 20% discount = 10%. 1.0 * 0.9 = 0.90 tons.
    expect(breakdown.waste).toBe(0.9);

    expect(breakdown.total).toBe(19.21); // 5.75 + 9.30 + 3.27 + 0.90
  });
});
