import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignIn from '../pages/Auth/SignIn';
import SignUp from '../pages/Auth/SignUp';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import { AuthProvider } from '../contexts/AuthContext';

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

describe('Authentication Pages UI & Form Validations', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('SignIn page renders form inputs, handles demo credentials, and logs in', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <SignIn />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const submitBtn = screen.getByRole('button', { name: /^Sign In$/i });

    // Try submitting empty
    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.click(submitBtn);

    // Enter correct credentials
    fireEvent.change(emailInput, { target: { value: 'eco@citizen.com' } });
    fireEvent.change(passwordInput, { target: { value: 'sustainability' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
    });
  });

  it('SignUp page renders inputs, checks password criteria, and submits', async () => {
    render(
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
    const submitBtn = screen.getByRole('button', { name: /^Create Account$/i });

    // Test mismatched passwords
    fireEvent.change(nameInput, { target: { value: 'Jane Eco' } });
    fireEvent.change(emailInput, { target: { value: 'jane@eco.com' } });
    fireEvent.change(passwordInput, { target: { value: 'pass123' } });
    fireEvent.change(confirmInput, { target: { value: 'pass456' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();

    // Test weak password
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.change(confirmInput, { target: { value: '123' } });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/Password must be at least 6 characters long/i)
    ).toBeInTheDocument();

    // Test successful submission
    fireEvent.change(passwordInput, { target: { value: 'securepassword' } });
    fireEvent.change(confirmInput, { target: { value: 'securepassword' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
    });
  });

  it('ForgotPassword page handles email inputs and submits recovery request', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <ForgotPassword />
        </AuthProvider>
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email Address/i);
    const submitBtn = screen.getByRole('button', { name: /Send Reset Code/i });

    // Submit valid email
    fireEvent.change(emailInput, { target: { value: 'eco@citizen.com' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Instructions Sent/i)).toBeInTheDocument();
  });
});
