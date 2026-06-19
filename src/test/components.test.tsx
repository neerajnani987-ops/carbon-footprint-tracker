import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import Layout from '../components/Layout';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import { AppStateProvider } from '../contexts/AppStateContext';

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

const BuggyComponent: React.FC = () => {
  throw new Error('Simulated render error');
};

describe('ErrorBoundary Component Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Safe Child</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Safe Child');
  });

  it('catches crashes and renders recovery page with reload button', () => {
    // Suppress console.error during throwing test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something Went Wrong/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reload Application/i })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});

describe('Layout Shell Testing', () => {
  it('correctly renders sidebar, header links, and main landmarks', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <LanguageProvider>
          <AuthProvider>
            <AppStateProvider>
              <Layout>
                <div data-testid="inner-view">Dashboard View</div>
              </Layout>
            </AppStateProvider>
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('inner-view')).toHaveTextContent('Dashboard View');
    expect(screen.getAllByRole('banner')[0]).toBeInTheDocument(); // <header>
    expect(screen.getByRole('navigation')).toBeInTheDocument(); // <nav>
    expect(screen.getByRole('main')).toBeInTheDocument(); // <main>
  });
});
