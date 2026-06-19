import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../pages/NotFound';

describe('NotFound Page UI & Redirects', () => {
  it('renders 404 warning information and triggers home page redirect on click', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText(/Error 404/i)).toBeInTheDocument();
    expect(screen.getByText(/Lost in the Forest/i)).toBeInTheDocument();

    const backBtn = screen.getByRole('button', { name: /Back to Home/i });
    expect(backBtn).toBeInTheDocument();

    fireEvent.click(backBtn);
  });
});
