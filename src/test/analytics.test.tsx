import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Analytics from '../pages/Analytics';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import { AppStateProvider } from '../contexts/AppStateContext';

vi.mock('canvas-confetti', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('Analytics Page UI & Computations', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders placeholder screen when calculator has not been completed', async () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppStateProvider>
              <Analytics />
            </AppStateProvider>
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Advanced Carbon Analytics/i)).toBeInTheDocument();
      expect(screen.getByText(/No Calculator Metrics Found/i)).toBeInTheDocument();
    });
  });

  it('renders comparative charts and metrics when calculator has been completed', async () => {
    // Inject mock calculator data into localStorage
    const mockState = {
      hasCompletedCalc: true,
      calculator: {
        vehicleType: 'petrol',
        vehicleMiles: 100,
        flightsShort: 2,
        flightsLong: 1,
        electricBill: 120,
        gasBill: 60,
        cleanEnergyShare: 20,
        dietType: 'moderate-meat',
        localFoodShare: 40,
        wasteBags: 3,
        recyclingRate: 50,
      },
      totalSavings: 15.0,
      streak: 3,
      dailyLogs: {
        '2026-06-19': ['transit-commute', 'meatless-meals'],
      },
      unlockedBadges: { 'carbon-pioneer': '2026-06-18' },
    };

    localStorage.setItem('ecotrace_app_state', JSON.stringify(mockState));
    localStorage.setItem(
      'ecotrace_user',
      JSON.stringify({ uid: 'mock-uid', email: 'mock@eco.com', name: 'Mock User' })
    );

    render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppStateProvider>
              <Analytics />
            </AppStateProvider>
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Advanced Carbon Analytics/i)).toBeInTheDocument();
      expect(screen.queryByText(/No Calculator Metrics Found/i)).toBeNull();

      // Verify stats cards are rendered
      expect(screen.getByText(/Target Offset Status/i)).toBeInTheDocument();
      expect(screen.getByText(/Category Carbon Benchmarking/i)).toBeInTheDocument();
      expect(screen.getByText(/Daily Actions Savings Timeline/i)).toBeInTheDocument();
    });
  });
});
