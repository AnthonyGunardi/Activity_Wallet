import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../../src/components/common/Header';

describe('Header Component Tests', () => {
  it('should render brand logo and navigation links', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText('Sepa Island')).toBeInTheDocument();
    expect(screen.getByText('Activity Wallet')).toBeInTheDocument();
    expect(screen.getByText('Dompet Peserta')).toBeInTheDocument();
    expect(screen.getByText('Scanner Booth')).toBeInTheDocument();
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });
});
