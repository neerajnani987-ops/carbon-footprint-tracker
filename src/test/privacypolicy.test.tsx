import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PrivacyPolicy from '../pages/PrivacyPolicy';

describe('PrivacyPolicy Page UI & Compliance Details', () => {
  it('correctly renders privacy center sections and back button navigation', () => {
    render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>
    );

    expect(screen.getByText(/EcoTrace Privacy Center/i)).toBeInTheDocument();
    expect(screen.getByText(/Privacy Policy & Data Protection/i)).toBeInTheDocument();
    expect(screen.getByText(/1\. Information We Collect/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Data Storage & Ownership/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. How We Use Data/i)).toBeInTheDocument();

    const backBtn = screen.getByRole('button', { name: /Go Back/i });
    expect(backBtn).toBeInTheDocument();

    fireEvent.click(backBtn);
  });
});
