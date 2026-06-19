import { describe, it, expect } from 'vitest';

import { calculateCarbonBreakdown } from '../utils';

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

    expect(breakdown.total).toBe(1.7); // 0.08 + 0.64 + 0.85 + 0.13
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

  it('correctly handles extreme / boundary inputs in calculations', () => {
    const zeroCalculator = {
      vehicleType: 'none',
      vehicleMiles: 0,
      flightsShort: 0,
      flightsLong: 0,
      electricBill: 0,
      gasBill: 0,
      cleanEnergyShare: 100,
      dietType: 'vegan',
      localFoodShare: 100,
      wasteBags: 0,
      recyclingRate: 100,
    };

    const breakdown = calculateCarbonBreakdown(zeroCalculator);
    expect(breakdown.transport).toBe(0);
    expect(breakdown.energy).toBe(0);
    expect(breakdown.diet).toBe(0.81);
    expect(breakdown.waste).toBe(0);
    expect(breakdown.total).toBe(0.81);
  });
});

import { validateCalculatorState, sanitizeText } from '../utils';

describe('Utility Functions - Validation & Sanitization', () => {
  it('clamps and validates calculator inputs correctly', () => {
    const invalidCalculator = {
      vehicleType: 'rocketship',
      vehicleMiles: -50,
      flightsShort: 500,
      electricBill: -100,
      cleanEnergyShare: 150,
      dietType: 'candy-diet',
      recyclingRate: -10,
    };

    const validated = validateCalculatorState(invalidCalculator);
    expect(validated.vehicleType).toBe('none');
    expect(validated.vehicleMiles).toBe(0);
    expect(validated.flightsShort).toBe(100);
    expect(validated.electricBill).toBe(0);
    expect(validated.cleanEnergyShare).toBe(100);
    expect(validated.dietType).toBe('moderate-meat');
    expect(validated.recyclingRate).toBe(0);
  });

  it('sanitizes text inputs to prevent XSS script injections', () => {
    const maliciousInput = '<script>alert("hack")</script>';
    const sanitized = sanitizeText(maliciousInput);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');

    const normalInput = 'Hello Eco citizen!';
    expect(sanitizeText(normalInput)).toBe(normalInput);

    expect(sanitizeText('')).toBe('');
  });
});
