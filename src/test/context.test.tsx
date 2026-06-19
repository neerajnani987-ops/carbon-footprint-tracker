import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppStateProvider, useAppState } from '../contexts/AppStateContext';
import { AuthContext } from '../contexts/AuthContext';
import { User } from '../types';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  __esModule: true,
  default: vi.fn(),
}));

const TestComponent: React.FC = () => {
  const {
    calculator,
    dailyLogs,
    totalSavings,
    streak,
    lastLoggedDate,
    hasCompletedCalc,
    unlockedBadges,
    updateCalculator,
    saveCalculatorResults,
    submitDailyLog,
  } = useAppState();

  return (
    <div>
      <div data-testid="streak">{streak}</div>
      <div data-testid="total-savings">{totalSavings}</div>
      <div data-testid="has-completed-calc">{hasCompletedCalc ? 'true' : 'false'}</div>
      <div data-testid="last-logged-date">{lastLoggedDate || 'none'}</div>
      <div data-testid="vehicle-miles">{calculator.vehicleMiles}</div>
      <div data-testid="recycling-rate">{calculator.recyclingRate}</div>

      <button
        data-testid="update-calc"
        onClick={() =>
          updateCalculator({
            vehicleMiles: 150,
            recyclingRate: 80,
            electricBill: 10,
            gasBill: 5,
            cleanEnergyShare: 100,
          })
        }
      >
        Update Calc
      </button>
      <button data-testid="save-calc" onClick={saveCalculatorResults}>
        Save Calc
      </button>
      <button data-testid="log-commute" onClick={() => submitDailyLog(['bike-walk-commute'])}>
        Log Commute
      </button>
      <button data-testid="log-meatless" onClick={() => submitDailyLog(['meatless-meals'])}>
        Log Meatless
      </button>
      <button
        data-testid="log-combo"
        onClick={() => submitDailyLog(['bike-walk-commute', 'meatless-meals'])}
      >
        Log Combo
      </button>

      <div data-testid="unlocked-badges">{Object.keys(unlockedBadges).join(',')}</div>
      <div data-testid="daily-logs-count">{Object.keys(dailyLogs).length}</div>
    </div>
  );
};

interface ProviderWrapperProps {
  children: React.ReactNode;
  user: User | null;
}

const MockAuthProvider: React.FC<ProviderWrapperProps> = ({ children, user }) => {
  const mockValue = {
    user,
    isAuthenticated: !!user,
    loading: false,
    error: null,
    signIn: async () => true,
    signUp: async () => true,
    signOut: () => {},
    resetPassword: async () => true,
    clearError: () => {},
    signInWithGoogle: async () => true,
  };

  return <AuthContext.Provider value={mockValue}>{children}</AuthContext.Provider>;
};

describe('AppStateContext State Mutations & Badges', () => {
  const testUser: User = {
    uid: 'test-user-123',
    name: 'Test Citizen',
    email: 'test@citizen.com',
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('correctly initialises state from AuthContext user', async () => {
    render(
      <MockAuthProvider user={testUser}>
        <AppStateProvider>
          <TestComponent />
        </AppStateProvider>
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('vehicle-miles')).toHaveTextContent('50');
    });

    expect(screen.getByTestId('streak')).toHaveTextContent('0');
    expect(screen.getByTestId('total-savings')).toHaveTextContent('0');
    expect(screen.getByTestId('has-completed-calc')).toHaveTextContent('false');
    expect(screen.getByTestId('last-logged-date')).toHaveTextContent('none');
  });

  it('updates calculator state correctly', async () => {
    render(
      <MockAuthProvider user={testUser}>
        <AppStateProvider>
          <TestComponent />
        </AppStateProvider>
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('vehicle-miles')).toHaveTextContent('50');
    });

    const updateBtn = screen.getByTestId('update-calc');
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(screen.getByTestId('vehicle-miles')).toHaveTextContent('150');
    });
    expect(screen.getByTestId('recycling-rate')).toHaveTextContent('80');
  });

  it('saves calculator results and unlocks carbon-pioneer, energy-guardian and waste-ninja badges', async () => {
    render(
      <MockAuthProvider user={testUser}>
        <AppStateProvider>
          <TestComponent />
        </AppStateProvider>
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('vehicle-miles')).toHaveTextContent('50');
    });

    expect(screen.getByTestId('unlocked-badges')).toHaveTextContent('');

    const updateBtn = screen.getByTestId('update-calc');
    fireEvent.click(updateBtn);

    const saveBtn = screen.getByTestId('save-calc');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByTestId('has-completed-calc')).toHaveTextContent('true');
    });

    const badgesText = screen.getByTestId('unlocked-badges').textContent;
    expect(badgesText).toContain('carbon-pioneer');
    expect(badgesText).toContain('waste-ninja');
    expect(badgesText).toContain('energy-guardian');
  });

  it('submits daily logs, calculates correct CO2 savings, and manages streak', async () => {
    render(
      <MockAuthProvider user={testUser}>
        <AppStateProvider>
          <TestComponent />
        </AppStateProvider>
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('vehicle-miles')).toHaveTextContent('50');
    });

    const logCommuteBtn = screen.getByTestId('log-commute');
    fireEvent.click(logCommuteBtn);

    await waitFor(() => {
      expect(screen.getByTestId('total-savings')).toHaveTextContent('3.2');
    });
    expect(screen.getByTestId('streak')).toHaveTextContent('1');
    expect(screen.getByTestId('last-logged-date')).not.toHaveTextContent('none');
    expect(screen.getByTestId('daily-logs-count')).toHaveTextContent('1');
  });

  it('unlocks pedal-power badge after 3 commute logs', async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const dayBefore = new Date(Date.now() - 172800000).toISOString().split('T')[0];

    const initialData = {
      calculator: {
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
      },
      dailyLogs: {
        [yesterday]: ['bike-walk-commute'],
        [dayBefore]: ['transit-commute'],
      },
      totalSavings: 5.7,
      streak: 2,
      lastLoggedDate: yesterday,
      hasCompletedCalc: false,
      unlockedBadges: {},
    };

    localStorage.setItem('ecotrace_app_state', JSON.stringify(initialData));

    render(
      <MockAuthProvider user={testUser}>
        <AppStateProvider>
          <TestComponent />
        </AppStateProvider>
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('streak')).toHaveTextContent('2');
    });

    const logCommuteBtn = screen.getByTestId('log-commute');
    fireEvent.click(logCommuteBtn);

    await waitFor(() => {
      expect(screen.getByTestId('unlocked-badges')).toHaveTextContent(/pedal-power/);
    });
  });

  it('unlocks herbivore badge after 5 plant-based meals logs', async () => {
    const dates = Array.from({ length: 4 }).map((_, i) => {
      return new Date(Date.now() - (i + 1) * 86400000).toISOString().split('T')[0];
    });

    const dailyLogsMock: Record<string, string[]> = {};
    dates.forEach((d) => {
      dailyLogsMock[d] = ['meatless-meals'];
    });

    const initialData = {
      calculator: {
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
      },
      dailyLogs: dailyLogsMock,
      totalSavings: 6.0,
      streak: 4,
      lastLoggedDate: dates[0],
      hasCompletedCalc: false,
      unlockedBadges: {},
    };

    localStorage.setItem('ecotrace_app_state', JSON.stringify(initialData));

    render(
      <MockAuthProvider user={testUser}>
        <AppStateProvider>
          <TestComponent />
        </AppStateProvider>
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('streak')).toHaveTextContent('4');
    });

    const logMeatlessBtn = screen.getByTestId('log-meatless');
    fireEvent.click(logMeatlessBtn);

    await waitFor(() => {
      expect(screen.getByTestId('unlocked-badges')).toHaveTextContent(/herbivore/);
    });
  });

  it('unlocks green-streak badge after 5 consecutive days streak', async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const initialData = {
      calculator: {
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
      },
      dailyLogs: {},
      totalSavings: 10.0,
      streak: 4,
      lastLoggedDate: yesterday,
      hasCompletedCalc: false,
      unlockedBadges: {},
    };

    localStorage.setItem('ecotrace_app_state', JSON.stringify(initialData));

    render(
      <MockAuthProvider user={testUser}>
        <AppStateProvider>
          <TestComponent />
        </AppStateProvider>
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('streak')).toHaveTextContent('4');
    });

    const logCommuteBtn = screen.getByTestId('log-commute');
    fireEvent.click(logCommuteBtn);

    await waitFor(() => {
      expect(screen.getByTestId('streak')).toHaveTextContent('5');
    });
    expect(screen.getByTestId('unlocked-badges')).toHaveTextContent(/green-streak/);
  });

  it('unlocks eco-champion badge at total savings >= 50 kg', async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const initialData = {
      calculator: {
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
      },
      dailyLogs: {},
      totalSavings: 48.0,
      streak: 1,
      lastLoggedDate: yesterday,
      hasCompletedCalc: false,
      unlockedBadges: {},
    };

    localStorage.setItem('ecotrace_app_state', JSON.stringify(initialData));

    render(
      <MockAuthProvider user={testUser}>
        <AppStateProvider>
          <TestComponent />
        </AppStateProvider>
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('total-savings')).toHaveTextContent('48');
    });

    const logComboBtn = screen.getByTestId('log-combo');
    fireEvent.click(logComboBtn);

    await waitFor(() => {
      expect(screen.getByTestId('unlocked-badges')).toHaveTextContent(/eco-champion/);
    });
  });

  it('unlocks tree-planter badge at total savings >= 110 kg', async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const initialData = {
      calculator: {
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
      },
      dailyLogs: {},
      totalSavings: 108.0,
      streak: 1,
      lastLoggedDate: yesterday,
      hasCompletedCalc: false,
      unlockedBadges: {},
    };

    localStorage.setItem('ecotrace_app_state', JSON.stringify(initialData));

    render(
      <MockAuthProvider user={testUser}>
        <AppStateProvider>
          <TestComponent />
        </AppStateProvider>
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('total-savings')).toHaveTextContent('108');
    });

    const logComboBtn = screen.getByTestId('log-combo');
    fireEvent.click(logComboBtn);

    await waitFor(() => {
      expect(screen.getByTestId('unlocked-badges')).toHaveTextContent(/tree-planter/);
    });
  });

  it('synchronises state changes to LocalStorage', async () => {
    render(
      <MockAuthProvider user={testUser}>
        <AppStateProvider>
          <TestComponent />
        </AppStateProvider>
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('vehicle-miles')).toHaveTextContent('50');
    });

    const logCommuteBtn = screen.getByTestId('log-commute');
    fireEvent.click(logCommuteBtn);

    await waitFor(() => {
      expect(screen.getByTestId('total-savings')).toHaveTextContent('3.2');
    });

    const storedState = localStorage.getItem('ecotrace_app_state');
    expect(storedState).not.toBeNull();
    const parsedState = JSON.parse(storedState!);
    expect(parsedState.totalSavings).toBe(3.2);
    expect(parsedState.streak).toBe(1);
    expect(parsedState.lastLoggedDate).not.toBeNull();
  });
});
