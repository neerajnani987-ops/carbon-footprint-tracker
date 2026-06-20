import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Challenges from '../pages/Challenges';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import { AppStateProvider } from '../contexts/AppStateContext';
import { AppStateData } from '../types';

vi.mock('canvas-confetti', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('Goals and Challenges System', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const setupTest = (mockState: Partial<AppStateData>) => {
    localStorage.setItem('ecotrace_app_state', JSON.stringify(mockState));
    localStorage.setItem(
      'ecotrace_user',
      JSON.stringify({ uid: 'mock-user-123', email: 'mock@eco.com', name: 'Mock User' })
    );

    return render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppStateProvider>
              <Challenges />
            </AppStateProvider>
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );
  };

  it('allows user to customize and save monthly and yearly eco goals', async () => {
    const initialState = {
      calculator: {
        vehicleType: 'petrol',
        vehicleMiles: 20,
        flightsShort: 0,
        flightsLong: 0,
        electricBill: 10,
        gasBill: 5,
        cleanEnergyShare: 50,
        dietType: 'vegetarian',
        localFoodShare: 50,
        wasteBags: 2,
        recyclingRate: 50,
      },
      totalSavings: 15.0,
      streak: 1,
      dailyLogs: {},
      unlockedBadges: {},
      monthlyGoal: 60,
      yearlyGoal: 700,
      ecoPoints: 100,
    };

    setupTest(initialState);

    // Wait for the form to load with initial goals values
    await waitFor(() => {
      expect(screen.getByLabelText(/Monthly CO₂ Reduction Goal/i)).toHaveValue(60);
      expect(screen.getByLabelText(/Yearly CO₂ Reduction Goal/i)).toHaveValue(700);
    });

    const monthlyInput = screen.getByLabelText(/Monthly CO₂ Reduction Goal/i);
    const yearlyInput = screen.getByLabelText(/Yearly CO₂ Reduction Goal/i);
    const saveButton = screen.getByRole('button', { name: /Save Goals/i });

    // Change input values
    fireEvent.change(monthlyInput, { target: { value: 120 } });
    fireEvent.change(yearlyInput, { target: { value: 850 } });

    // Click save
    fireEvent.click(saveButton);

    // Wait and verify that state updates are reflected and saved in localStorage
    await waitFor(() => {
      const stored = localStorage.getItem('ecotrace_app_state');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.monthlyGoal).toBe(120);
      expect(parsed.yearlyGoal).toBe(850);
    });
  });

  it('calculates challenge completions correctly and allows claiming Eco Points', async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const initialState = {
      calculator: {
        vehicleType: 'petrol',
        vehicleMiles: 20,
        flightsShort: 0,
        flightsLong: 0,
        electricBill: 10,
        gasBill: 5,
        cleanEnergyShare: 50,
        dietType: 'vegetarian',
        localFoodShare: 50,
        wasteBags: 2,
        recyclingRate: 50,
      },
      totalSavings: 15.0,
      streak: 1,
      // User performed "energy-standby" and "meatless-meals" today to satisfy Daily challenges
      dailyLogs: {
        [todayStr]: ['energy-standby', 'meatless-meals'],
      },
      unlockedBadges: {},
      monthlyGoal: 60,
      yearlyGoal: 700,
      ecoPoints: 125,
    };

    setupTest(initialState);

    // Verify initial eco points representation
    await waitFor(() => {
      expect(screen.getByText(/125/)).toBeInTheDocument();
    });

    // Locate the claim points buttons for completed challenges
    // Phantom Power Buster is completed because todayActions includes 'energy-standby'
    const claimButtons = screen.getAllByRole('button', { name: /Claim Points/i });
    expect(claimButtons.length).toBeGreaterThanOrEqual(2);

    // Claim points for the first completed challenge
    fireEvent.click(claimButtons[0]);

    // Check points increment in display
    await waitFor(() => {
      // 125 + 10 points = 135 points
      expect(screen.getByText(/135/)).toBeInTheDocument();
    });

    // Check that button shows "Completed"
    expect(screen.getByRole('button', { name: /^Completed$/i })).toBeInTheDocument();

    // Verify claimed list was stored in localStorage
    const claimedStored = localStorage.getItem('ecotrace_claimed_challenges');
    expect(claimedStored).not.toBeNull();
    const parsedClaimed = JSON.parse(claimedStored!);
    expect(parsedClaimed[`${todayStr}_phantom-buster`]).toBe(true);
  });
});
