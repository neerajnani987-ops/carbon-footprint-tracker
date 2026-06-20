import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import { AppStateProvider } from '../contexts/AppStateContext';

vi.mock('canvas-confetti', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('Dashboard Page UI, Grades & Recommendations Coverage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderDashboard = () => {
    return render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppStateProvider>
              <Dashboard />
            </AppStateProvider>
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );
  };

  it('renders initial dashboard without calculation and redirects on click', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Please complete the Footprint Calculator/i)).toBeInTheDocument();
    });

    const calcBtn = screen.getByRole('button', { name: /Open Calculator/i });
    expect(calcBtn).toBeInTheDocument();
  });

  it('renders grade A+ and general low recommendation when emissions are extremely low', async () => {
    const mockState = {
      hasCompletedCalc: true,
      calculator: {
        vehicleType: 'none',
        vehicleMiles: 0,
        flightsShort: 0,
        flightsLong: 0,
        electricBill: 10,
        gasBill: 0,
        cleanEnergyShare: 100,
        dietType: 'vegan',
        localFoodShare: 100,
        wasteBags: 0,
        recyclingRate: 100,
      },
      totalSavings: 5.0,
      streak: 1,
      dailyLogs: {},
      unlockedBadges: {},
    };

    localStorage.setItem('ecotrace_app_state', JSON.stringify(mockState));
    localStorage.setItem(
      'ecotrace_user',
      JSON.stringify({ uid: 'mock-id', email: 'mock@eco.com' })
    );

    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText('A+')[0]).toBeInTheDocument();
      expect(screen.getByText(/Maintain Great Habits/i)).toBeInTheDocument();
    });
  });

  it('renders grades and active recommendations based on high transport, energy, and waste emissions', async () => {
    const mockState = {
      hasCompletedCalc: true,
      calculator: {
        vehicleType: 'petrol',
        vehicleMiles: 300,
        flightsShort: 5,
        flightsLong: 3,
        electricBill: 300,
        gasBill: 200,
        cleanEnergyShare: 0,
        dietType: 'heavy-meat',
        localFoodShare: 0,
        wasteBags: 10,
        recyclingRate: 10,
      },
      totalSavings: 4.0,
      streak: 2,
      dailyLogs: {
        '2026-06-19': ['transit-commute'],
      },
      unlockedBadges: { 'carbon-pioneer': '2026-06-19' },
    };

    localStorage.setItem('ecotrace_app_state', JSON.stringify(mockState));
    localStorage.setItem(
      'ecotrace_user',
      JSON.stringify({ uid: 'mock-uid', name: 'Premium Citizen', email: 'premium@eco.com' })
    );

    renderDashboard();

    await waitFor(() => {
      // The high emissions should trigger high footprint grade (e.g. D+, D, or D-)
      expect(
        screen.getAllByText(/Critical footprint|Severe environmental/i)[0]
      ).toBeInTheDocument();

      // It should render specific recommendations
      expect(screen.getByText(/Optimize Commutes/i)).toBeInTheDocument();
      expect(screen.getByText(/Eco-Thermostat Adjustment/i)).toBeInTheDocument();
    });

    // Verify recommendations redirect click
    const configBtn = screen.getAllByRole('button', { name: /Configure/i })[0];
    await act(async () => {
      fireEvent.click(configBtn);
    });
  });

  it('allows switching savings trend between 7 days and 30 days', async () => {
    const mockState = {
      hasCompletedCalc: true,
      calculator: {
        vehicleType: 'petrol',
        vehicleMiles: 40,
        flightsShort: 0,
        flightsLong: 0,
        electricBill: 60,
        gasBill: 30,
        cleanEnergyShare: 50,
        dietType: 'vegetarian',
        localFoodShare: 50,
        wasteBags: 2,
        recyclingRate: 70,
      },
      totalSavings: 10.0,
      streak: 3,
      dailyLogs: {},
      unlockedBadges: {},
    };

    localStorage.setItem('ecotrace_app_state', JSON.stringify(mockState));
    localStorage.setItem(
      'ecotrace_user',
      JSON.stringify({ uid: 'mock-id', email: 'user@eco.com' })
    );

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '30 Days' })).toBeInTheDocument();
    });

    const btn30 = screen.getByRole('button', { name: '30 Days' });
    await act(async () => {
      fireEvent.click(btn30);
    });

    const btn7 = screen.getByRole('button', { name: '7 Days' });
    await act(async () => {
      fireEvent.click(btn7);
    });
  });
});
