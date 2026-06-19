import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AIAssistant from '../pages/AIAssistant';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import { AppStateProvider } from '../contexts/AppStateContext';

vi.mock('canvas-confetti', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('AIAssistant Page UI & Interactions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders typing input, title, and initial greeting', () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppStateProvider>
              <AIAssistant />
            </AppStateProvider>
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /AI Sustainability Assistant/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask me anything about/i)).toBeInTheDocument();
    expect(screen.getByText(/Hello Eco-Citizen/i)).toBeInTheDocument();
    expect(screen.getByText(/Suggested Questions/i)).toBeInTheDocument();
  });


  it('handles message submission and shows loading state and response after delay', async () => {
    vi.useFakeTimers();
    render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppStateProvider>
              <AIAssistant />
            </AppStateProvider>
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Ask me anything about/i);
    const sendButton = screen.getByTitle('Send Message');

    fireEvent.change(input, { target: { value: 'Analyze my monthly footprint.' } });

    // Flush input value update
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(input).toHaveValue('Analyze my monthly footprint.');

    act(() => {
      fireEvent.click(sendButton);
    });

    // Flush messages update and typing state
    act(() => {
      vi.advanceTimersByTime(0);
    });

    // User message should show immediately
    expect(screen.getByText('Analyze my monthly footprint.')).toBeInTheDocument();

    // Typing indicator should appear
    expect(screen.getByPlaceholderText(/Ask me anything about/i)).toBeDisabled();

    // Fast-forward mock timer for response delay
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    // AI response should be rendered immediately
    expect(screen.getByText(/It looks like you haven't completed your Carbon Footprint Calculator yet/i)).toBeInTheDocument();

    expect(input).not.toBeDisabled();
    vi.useRealTimers();
  });


  it('handles suggested question clicks correctly', async () => {
    vi.useFakeTimers();

    render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppStateProvider>
              <AIAssistant />
            </AppStateProvider>
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    const questionBtn = screen.getByText('Tips for zero-waste recycling.');
    act(() => {
      fireEvent.click(questionBtn);
    });

    // Flush click action state updates
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByText('Tips for zero-waste recycling.')).toBeInTheDocument();

    // Fast-forward delay
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.getByText(/Your household waste production is/i)).toBeInTheDocument();

    vi.useRealTimers();
  });


  it('handles key down Enter submission', async () => {
    vi.useFakeTimers();
    render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppStateProvider>
              <AIAssistant />
            </AppStateProvider>
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );


    const input = screen.getByPlaceholderText(/Ask me anything about/i);
    fireEvent.change(input, { target: { value: 'How can I reduce my transport emissions?' } });

    // Flush input value update
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(input).toHaveValue('How can I reduce my transport emissions?');

    act(() => {
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    });

    // Flush keydown state updates
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByText('How can I reduce my transport emissions?')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.getByText(/Your primary transport is/i)).toBeInTheDocument();

    vi.useRealTimers();
  });

});
