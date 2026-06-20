import { CalculatorState, Badge } from '../types';

export const BADGES: Badge[] = [
  {
    id: 'carbon-pioneer',
    name: 'Carbon Pioneer',
    desc: 'Completed your first carbon footprint calculation.',
    icon: 'compass',
    category: 'General',
  },
  {
    id: 'energy-guardian',
    name: 'Energy Guardian',
    desc: 'Maintained an annual home energy footprint below 1.5 tons CO₂e.',
    icon: 'zap',
    category: 'Energy',
  },
  {
    id: 'pedal-power',
    name: 'Pedal Power',
    desc: 'Logged walking, cycling, or transit commutes 3 or more times.',
    icon: 'bike',
    category: 'Transport',
  },
  {
    id: 'herbivore',
    name: 'Herbivore Hero',
    desc: 'Logged plant-based meals on 5 different days.',
    icon: 'salad',
    category: 'Diet',
  },
  {
    id: 'waste-ninja',
    name: 'Waste Ninja',
    desc: 'Achieved a household recycling rate of 75% or higher.',
    icon: 'trash-2',
    category: 'Waste',
  },
  {
    id: 'eco-champion',
    name: 'Eco Champion',
    desc: 'Avoided a total of 50 kg or more of carbon emissions through tracker logs.',
    icon: 'award',
    category: 'General',
  },
  {
    id: 'green-streak',
    name: 'Green Streak',
    desc: 'Logged your sustainable actions for 5 consecutive days.',
    icon: 'flame',
    category: 'General',
  },
  {
    id: 'tree-planter',
    name: 'Tree Planter',
    desc: 'Offset the equivalent carbon absorption of 5 mature trees (110 kg CO₂e).',
    icon: 'sprout',
    category: 'General',
  },
  {
    id: 'green-beginner',
    name: 'Green Beginner',
    desc: 'Logged your first sustainable daily action.',
    icon: 'leaf',
    category: 'General',
  },
  {
    id: 'eco-warrior',
    name: 'Eco Warrior',
    desc: 'Maintained a 3-day logging streak or completed 3 challenges.',
    icon: 'shield',
    category: 'General',
  },
  {
    id: 'carbon-saver',
    name: 'Carbon Saver',
    desc: 'Reached a total of 20 kg in carbon savings.',
    icon: 'award',
    category: 'General',
  },
  {
    id: 'planet-protector',
    name: 'Planet Protector',
    desc: 'Reached a total of 100 kg in carbon savings.',
    icon: 'globe',
    category: 'General',
  },
];

export const INITIAL_CALCULATOR: CalculatorState = {
  vehicleType: 'petrol',
  vehicleMiles: 50,
  flightsShort: 2,
  flightsLong: 0,
  electricBill: 80,
  gasBill: 40,
  cleanEnergyShare: 0,
  dietType: 'moderate-meat',
  localFoodShare: 20,
  wasteBags: 2,
  recyclingRate: 30,
};

export const COEFFS = {
  vehicle: {
    petrol: 0.411,
    diesel: 0.355,
    hybrid: 0.22,
    ev: 0.08,
    motorbike: 0.18,
    none: 0.0,
  } as Record<string, number>,
  flights: { short: 225, long: 820 },
  electric: { kwhCost: 0.15, co2PerKwh: 0.39 },
  gas: { thermCost: 1.0, co2PerTherm: 5.3 },
  diet: {
    'heavy-meat': 3.3,
    'moderate-meat': 2.5,
    'low-meat': 1.7,
    vegetarian: 1.2,
    vegan: 0.9,
  } as Record<string, number>,
  waste: { perBag: 0.25 },
};

export const ACTION_SAVINGS: Record<string, number> = {
  'transit-commute': 2.5,
  'bike-walk-commute': 3.2,
  carpool: 1.8,
  'energy-standby': 0.3,
  'dryer-avoid': 0.8,
  'temp-thermostat': 1.2,
  'meatless-meals': 1.5,
  'zero-food-waste': 0.5,
  'plastic-free': 0.2,
  composting: 0.4,
};
