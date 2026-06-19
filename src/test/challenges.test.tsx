import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Challenges from '../pages/Challenges';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import { AppStateProvider } from '../contexts/AppStateContext';

vi.mock('canvas-confetti', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('Challenges Page UI & Milestones', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders badges grid and quest checklist details', async () => {
    const mockState = {
      hasCompletedCalc: true,
      calculator: {
        vehicleType: 'petrol',
        vehicleMiles: 50,
        flightsShort: 0,
        flightsLong: 0,
        electricBill: 40,
        gasBill: 20,
        cleanEnergyShare: 100,
        dietType: 'vegan',
        localFoodShare: 80,
        wasteBags: 1,
        recyclingRate: 90,
      },
      totalSavings: 20.0,
      streak: 2,
      dailyLogs: {},
      unlockedBadges: {
        'carbon-pioneer': '2026-06-19',
      },
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
              <Challenges />
            </AppStateProvider>
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Achievements & Badges/i)).toBeInTheDocument();

      // Check unlocked badge status is shown
      expect(screen.getByText(/Unlocked 2026-06-19/i)).toBeInTheDocument();

      // Check locked badges status is shown
      expect(screen.getAllByText(/Locked/i).length).toBeGreaterThan(0);

      // Check quests progress is shown
      expect(screen.getByText(/Commute Green/i)).toBeInTheDocument();
      expect(screen.getByText(/Plant-Based Week/i)).toBeInTheDocument();
      expect(screen.getByText(/0 \/ 3 logs/i)).toBeInTheDocument();
      expect(screen.getByText(/20 \/ 50 kg/i)).toBeInTheDocument();
    });
  });
});
