import '@testing-library/jest-dom';
import { vi } from 'vitest';

window.HTMLElement.prototype.scrollIntoView = vi.fn();

vi.mock('react-chartjs-2', () => ({
  Bar: () => null,
  Line: () => null,
  Doughnut: () => null,
  Pie: () => null,
}));
