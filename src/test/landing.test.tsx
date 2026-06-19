import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from '../pages/Landing';

describe('Landing Page UI & Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders landing hero, benefits, features, and FAQs sections', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    expect(screen.getByText(/Measure Your Carbon/i)).toBeInTheDocument();
    expect(screen.getByText(/Carbon Footprint Calculator/i)).toBeInTheDocument();
    expect(screen.getByText(/Save Electricity & Fuel Costs/i)).toBeInTheDocument();
    expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
  });

  it('toggles FAQ accordions when questions are clicked', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    const question = screen.getByText(
      /How does the calculator project my annual carbon footprint/i
    );
    fireEvent.click(question);

    // Verify it expands and shows answer content
    expect(screen.getByText(/weekly transportation commutes, airline flight/i)).toBeInTheDocument();
  });

  it('toggles mobile menu on mobile menu button clicks', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    const menuBtn = screen.getByRole('button', { name: /Open Menu/i });
    expect(menuBtn).toBeInTheDocument();

    fireEvent.click(menuBtn);
    expect(screen.getByRole('button', { name: /Close Menu/i })).toBeInTheDocument();
  });
});
