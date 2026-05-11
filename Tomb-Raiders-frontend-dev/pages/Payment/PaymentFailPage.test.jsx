import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PaymentFailPage from './PaymentFailPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('PaymentFailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  const renderPage = (initialUrl) =>
    render(
      <MemoryRouter initialEntries={[initialUrl]}>
        <Routes>
          <Route path="/payment-fail" element={<PaymentFailPage />} />
        </Routes>
      </MemoryRouter>,
    );

  it('renders the error details from the redirect query', () => {
    renderPage('/payment-fail?code=FAIL&message=cancelled');
    expect(screen.getByText('결제가 취소되었거나 실패했습니다.')).toBeInTheDocument();
    expect(screen.getByText('오류 코드: FAIL')).toBeInTheDocument();
    expect(screen.getByText('cancelled')).toBeInTheDocument();
  });

  it('uses the latest payment entry when navigating back to estimate or retrying payment', () => {
    sessionStorage.setItem(
      'payment-entry:last',
      JSON.stringify({
        order: { orderId: 77, title: 'Retry order' },
        estimateData: { quotationId: 901 },
      }),
    );

    renderPage('/payment-fail?message=retry');

    fireEvent.click(screen.getByRole('button', { name: '견적서 페이지로' }));
    expect(mockNavigate).toHaveBeenCalledWith('/estimate-detail', {
      state: { orderId: 77 },
    });

    fireEvent.click(screen.getByRole('button', { name: '다시 결제하기' }));
    expect(mockNavigate).toHaveBeenCalledWith('/payment', {
      replace: true,
      state: {
        order: { orderId: 77, title: 'Retry order' },
        estimateData: { quotationId: 901 },
      },
    });
  });
});
