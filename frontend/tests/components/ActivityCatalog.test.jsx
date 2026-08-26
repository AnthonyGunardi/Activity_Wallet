import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ActivityCatalog } from '../../src/components/participant/ActivityCatalog';

describe('ActivityCatalog Component Tests', () => {
  const mockActivities = [
    {
      id: 'act-1',
      name: 'Jet Ski',
      price: 350000,
      description: '15 menit bermain jet ski',
      is_affordable: true
    },
    {
      id: 'act-2',
      name: 'Flyboard Extreme',
      price: 800000,
      description: '20 menit terbang dengan flyboard',
      is_affordable: false
    }
  ];

  it('should render activities with prices and correct affordability badges', () => {
    render(<ActivityCatalog activities={mockActivities} currentBalance={500000} />);

    expect(screen.getByText('Jet Ski')).toBeInTheDocument();
    expect(screen.getByText('Rp 350.000')).toBeInTheDocument();
    expect(screen.getByText('Tersedia')).toBeInTheDocument();

    expect(screen.getByText('Flyboard Extreme')).toBeInTheDocument();
    expect(screen.getByText('Rp 800.000')).toBeInTheDocument();
    expect(screen.getByText('Saldo Kurang')).toBeInTheDocument();
  });

  it('should render empty state when no activities are available', () => {
    render(<ActivityCatalog activities={[]} currentBalance={500000} />);
    expect(screen.getByText('Belum ada aktivitas yang tersedia.')).toBeInTheDocument();
  });

  it('should render activities sorted by id ascending', () => {
    const unsortedActivities = [
      { id: 3, name: 'Snorkeling', price: 200000, is_affordable: true },
      { id: 1, name: 'Banana Boat', price: 150000, is_affordable: true },
      { id: 2, name: 'Donut Boat', price: 175000, is_affordable: true }
    ];

    render(<ActivityCatalog activities={unsortedActivities} currentBalance={500000} />);

    const titles = screen.getAllByRole('heading', { level: 4 }).map((el) => el.textContent);
    expect(titles).toEqual(['Banana Boat', 'Donut Boat', 'Snorkeling']);
  });
});
