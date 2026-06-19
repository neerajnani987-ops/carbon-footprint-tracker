import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import { AppStateProvider } from '../contexts/AppStateContext';
import SignUp from '../pages/Auth/SignUp';
import Calculator from '../pages/Calculator';
import Dashboard from '../pages/Dashboard';
import Tracker from '../pages/Tracker';
import Layout from '../components/Layout';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  __esModule: true,
  default: vi.fn(),
}));

// Mock window elements
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe('Full-Stack User Workflow Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('runs complete workflow: SignUp -> Calculator Entry -> Dashboard Analytics -> Daily Tracking -> Logout', async () => {
    // 1. SIGN UP
    const { unmount: unmountSignUp } = render(
      <MemoryRouter>
        <AuthProvider>
          <SignUp />
        </AuthProvider>
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const confirmInput = screen.getByLabelText(/^Confirm Password$/i);
    const submitSignUpBtn = screen.getByRole('button', { name: /^Create Account$/i });

    fireEvent.change(nameInput, { target: { value: 'Integration Citizen' } });
    fireEvent.change(emailInput, { target: { value: 'integration@eco.com' } });
    fireEvent.change(passwordInput, { target: { value: 'sustainability' } });
    fireEvent.change(confirmInput, { target: { value: 'sustainability' } });
    fireEvent.click(submitSignUpBtn);
    await waitFor(() => {
      expect(localStorage.getItem('ecotrace_user')).not.toBeNull();
    });

    unmountSignUp();

    // Verify localStorage has registered the user session
    const activeUser = JSON.parse(localStorage.getItem('ecotrace_user') || 'null');
    expect(activeUser).not.toBeNull();
    expect(activeUser.email).toBe('integration@eco.com');

    // 2. DASHBOARD (Initial empty calculator state)
    const { unmount: unmountDashboard1 } = render(
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

    // Wait for AppStateProvider to initialize state from localStorage user
    await screen.findByText(/Please complete the Footprint Calculator/i);
    expect(screen.getByRole('button', { name: /Open Calculator/i })).toBeInTheDocument();
    unmountDashboard1();

    // 3. CALCULATOR (Complete and Save Footprint)
    const { unmount: unmountCalculator } = render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppStateProvider>
              <Calculator />
            </AppStateProvider>
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    await screen.findByText(/Annual Footprint Calculator/i);

    // Complete Step 1: Commute Vehicle (default petrol 50 miles) -> Click Next
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Complete Step 2: Energy -> Set bills to low impact and Clean Grid share to 100% -> Click Next
    await waitFor(() => {
      expect(screen.getByLabelText(/Monthly Electricity Bill/i)).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText(/Monthly Electricity Bill/i), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/Monthly Natural Gas Bill/i), {
      target: { value: '5' },
    });
    fireEvent.change(screen.getByLabelText(/Clean \/ Solar Grid Share/i), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Complete Step 3: Diet -> Set diet to vegan and local share to 80% -> Click Next
    await waitFor(() => {
      expect(screen.getByLabelText(/Diet Pattern/i)).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText(/Diet Pattern/i), { target: { value: 'vegan' } });
    fireEvent.change(screen.getByLabelText(/Local \/ Organic Sourced Share/i), {
      target: { value: '80' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Complete Step 4: Waste -> Set recycling rate to 90% -> Save Results
    await waitFor(() => {
      expect(screen.getByLabelText(/Household Recycling Rate/i)).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText(/Household Recycling Rate/i), {
      target: { value: '90' },
    });

    const saveBtn = screen.getByRole('button', { name: /Save Results/i });
    fireEvent.click(saveBtn);

    unmountCalculator();

    // 4. DASHBOARD (Post-calculator analytics updates)
    const { unmount: unmountDashboard2 } = render(
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

    // Wait for dashboard to display grade (should show A+ to B depending on math)
    await screen.findByText(/Annual Footprint Projection/i);
    await waitFor(() => {
      expect(screen.queryByText(/Please complete the Footprint Calculator/i)).toBeNull();
    });

    // Check unlocked badges display on dashboard
    expect(screen.getByText(/Unlocked Badges/i)).toBeInTheDocument();
    unmountDashboard2();

    // 5. TRACKER (Log eco-actions and calculate net savings)
    const { unmount: unmountTracker } = render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppStateProvider>
              <Tracker />
            </AppStateProvider>
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    await screen.findByText(/Daily Action Tracker/i);

    // Toggle transit commute and plant-based meals checkboxes
    const transitCheckbox = screen.getByLabelText(/Took Public Transit/i);
    const mealsCheckbox = screen.getByLabelText(/Ate Plant-Based Meals/i);
    fireEvent.click(transitCheckbox);
    fireEvent.click(mealsCheckbox);

    // Submit daily log
    const submitLogBtn = screen.getByRole('button', { name: /Submit Today's Log/i });
    fireEvent.click(submitLogBtn);

    await waitFor(() => {
      expect(screen.getByText(/CO₂ Saved Today/i)).toBeInTheDocument();
    });
    // total CO2 saved: transit-commute (2.5) + meatless-meals (1.5) = 4.0 kg CO2 saved
    expect(screen.getByTestId('saved-co2-number')).toHaveTextContent('4.0');
    unmountTracker();

    // 6. SIGNOUT
    const { unmount: unmountLayout } = render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppStateProvider>
              <Layout>
                <div>Dummy View</div>
              </Layout>
            </AppStateProvider>
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    // Trigger Sign Out through layout profile drawer or button click
    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    fireEvent.click(signOutBtn);

    await waitFor(() => {
      expect(localStorage.getItem('ecotrace_user')).toBeNull();
    });
    unmountLayout();
  });
});
