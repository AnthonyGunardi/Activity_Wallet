import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SummaryMetricCard } from '../../src/components/admin/SummaryMetricCard';
import { Wallet } from 'lucide-react';

describe('SummaryMetricCard Component Tests', () => {
  it('should render title, value, subtitle, and icon', () => {
    render(
      <SummaryMetricCard
        title="Total Saldo Teralokasi"
        value="Rp 80.000.000"
        subtitle="80 Peserta terdaftar"
        icon={<Wallet data-testid="card-icon" />}
      />
    );

    expect(screen.getByText('Total Saldo Teralokasi')).toBeInTheDocument();
    expect(screen.getByText('Rp 80.000.000')).toBeInTheDocument();
    expect(screen.getByText('80 Peserta terdaftar')).toBeInTheDocument();
    expect(screen.getByTestId('card-icon')).toBeInTheDocument();
  });
});
