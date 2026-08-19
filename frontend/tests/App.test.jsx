import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App, { PlaceholderView } from '../src/App';

describe('App Root Integration Tests', () => {
  it('should render home view with cards and brand title', () => {
    render(<App />);

    expect(screen.getByText('Digital Activity Wallet')).toBeInTheDocument();
    expect(screen.getByText('Portal Peserta')).toBeInTheDocument();
    expect(screen.getByText('Scanner Booth Staff')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Supervisor')).toBeInTheDocument();
  });

  it('should render PlaceholderView component with title', () => {
    render(<PlaceholderView title="Custom Test Placeholder" />);
    expect(screen.getByText('Custom Test Placeholder')).toBeInTheDocument();
  });
});
