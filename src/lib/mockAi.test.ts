import { describe, it, expect } from 'vitest';
import { calculateCarbonDNA } from '@/lib/mockAi';

describe('calculateCarbonDNA', () => {
  it('calculates a score based on input data', () => {
    const input = {
      name: 'Test User',
      transportation: 'petrol_car',
      commuteMiles: 20,
      foodHabit: 'vegetarian',
      shoppingHabits: 'moderate',
      flightFrequency: 'occasional',
      energyBill: 2500,
      energySource: 'coal_grid',
      householdSize: 3,
    };
    const result = calculateCarbonDNA(input);
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('breakdown');
    expect(result.name).toBe('Test User');
    // basic sanity checks for score range
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
