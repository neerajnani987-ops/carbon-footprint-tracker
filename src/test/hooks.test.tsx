import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useAppState } from '../hooks/useAppState';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('Custom Hooks Coverage & Boundaries', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    const ComponentOutside = () => {
      useAuth();
      return null;
    };
    // Suppress console.error in vitest output for expected thrown errors
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ComponentOutside />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    spy.mockRestore();
  });

  it('throws error when useAppState is used outside AppStateProvider', () => {
    const ComponentOutside = () => {
      useAppState();
      return null;
    };
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ComponentOutside />)).toThrow(
      'useAppState must be used within an AppStateProvider'
    );
    spy.mockRestore();
  });

  it('throws error when useLanguage is used outside LanguageProvider', () => {
    const ComponentOutside = () => {
      useLanguage();
      return null;
    };
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ComponentOutside />)).toThrow(
      'useLanguage must be used within a LanguageProvider'
    );
    spy.mockRestore();
  });

  it('verifies useLanguage toggles languages and translates keys', async () => {
    const LangConsumer = () => {
      const { language, setLanguage, t } = useLanguage();
      return (
        <div>
          <span data-testid="lang">{language}</span>
          <span data-testid="title">{t('app.title')}</span>
          <button
            data-testid="toggle-lang"
            onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
          >
            Toggle
          </button>
        </div>
      );
    };

    render(
      <LanguageProvider>
        <LangConsumer />
      </LanguageProvider>
    );

    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    expect(screen.getByTestId('title')).toHaveTextContent('EcoTrace');

    fireEvent.click(screen.getByTestId('toggle-lang'));

    await waitFor(() => {
      expect(screen.getByTestId('lang')).toHaveTextContent('te');
    });
    expect(screen.getByTestId('title')).toHaveTextContent('EcoTrace (ఈకోట్రేస్)');
  });

  it('verifies useAuth provides correct values inside AuthProvider', async () => {
    const AuthConsumer = () => {
      const { user, isAuthenticated, signIn, signOut } = useAuth();
      return (
        <div>
          <span data-testid="auth-state">{isAuthenticated ? 'logged-in' : 'logged-out'}</span>
          <span data-testid="user-name">{user?.name || 'anonymous'}</span>
          <button
            data-testid="signin-btn"
            onClick={() => signIn('eco@citizen.com', 'sustainability')}
          >
            Sign In
          </button>
          <button data-testid="signout-btn" onClick={signOut}>
            Sign Out
          </button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-state')).toHaveTextContent('logged-out');

    fireEvent.click(screen.getByTestId('signin-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('logged-in');
    });
    expect(screen.getByTestId('user-name')).toHaveTextContent('Eco Citizen');

    fireEvent.click(screen.getByTestId('signout-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('logged-out');
    });
  });
});
