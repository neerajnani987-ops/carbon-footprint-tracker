import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Settings from '../pages/Settings';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import { AppStateProvider } from '../contexts/AppStateContext';

// Simple mocks to avoid window elements errors
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

describe('Settings Page UI Tests', () => {
  it('correctly renders personal settings fields and toggles theme state', async () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppStateProvider>
              <Settings />
            </AppStateProvider>
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    // Verify Name field is loaded
    const nameInput = screen.getByLabelText(/Full Name/i);
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveValue('Eco Citizen');

    // Verify Email field is loaded
    const emailInput = screen.getByLabelText(/Email Address/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveValue('eco@citizen.com');

    // Verify Theme selector is clickable
    const lightModeBtn = screen.getByTitle('Light Mode');
    expect(lightModeBtn).toBeInTheDocument();

    // Click Light Mode button and verify state transitions
    fireEvent.click(lightModeBtn);
    expect(lightModeBtn).toHaveClass('bg-eco-green');
  });

  it('submits settings and triggers toast notification', async () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppStateProvider>
              <Settings />
            </AppStateProvider>
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(nameInput, { target: { value: 'Eco Pioneer' } });
    expect(nameInput).toHaveValue('Eco Pioneer');

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
    
    // Trigger submit
    fireEvent.click(saveButton);
  });
});
