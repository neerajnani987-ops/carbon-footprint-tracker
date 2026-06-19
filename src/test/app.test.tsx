import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

vi.mock('canvas-confetti', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('App Router Shell & Rendering', () => {
  it('mounts without crashing and displays the landing screen', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Measure Your Carbon/i)).toBeInTheDocument();
    });
  });
});
