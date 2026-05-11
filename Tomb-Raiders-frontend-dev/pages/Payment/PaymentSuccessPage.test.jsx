import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PaymentSuccessPage from './PaymentSuccessPage';
import {
  clearPaymentContext,
  loadConfirmedPayment,
  saveConfirmedPayment,
  usePayment,
} from './usePayment';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('./usePayment', () => ({
  usePayment: vi.fn(),
  clearPaymentContext: vi.fn(),
  loadConfirmedPayment: vi.fn(),
  saveConfirmedPayment: vi.fn(),
  PAYMENT_CONTEXT_STORAGE_KEY: 'payment-context',
}));

describe('PaymentSuccessPage', () => {
  const mockConfirmPayment = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.mocked(usePayment).mockReturnValue({
      confirmPayment: mockConfirmPayment,
    });
    vi.mocked(loadConfirmedPayment).mockReturnValue(null);
  });

  const renderPage = (initialUrl) =>
    render(
      <MemoryRouter initialEntries={[initialUrl]}>
        <Routes>
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
        </Routes>
      </MemoryRouter>,
    );

  it('shows a fallback message when the redirect parameters are missing', () => {
    renderPage('/payment-success');
    expect(screen.getByText('결제 확인에 필요한 정보가 없습니다.')).toBeInTheDocument();
  });

  it('confirms the payment and uses the cached session context for follow-up navigation', async () => {
    sessionStorage.setItem(
      'payment-context:77',
      JSON.stringify({
        paymentUid: 'payment-1',
        orderId: 77,
        itemName: 'Custom figure',
      }),
    );
    mockConfirmPayment.mockResolvedValue({
      amount: 12000,
      status: 'PAID',
    });

    renderPage('/payment-success?paymentKey=ext-1&orderId=payment-1&amount=12000');

    expect(await screen.findByText('결제가 완료되었습니다.')).toBeInTheDocument();
    expect(mockConfirmPayment).toHaveBeenCalledWith({
      paymentUid: 'payment-1',
      paymentKey: 'ext-1',
      amount: 12000,
    });
    expect(saveConfirmedPayment).toHaveBeenCalledWith('payment-1', {
      amount: 12000,
      status: 'PAID',
    });
    expect(clearPaymentContext).toHaveBeenCalledWith('77');

    fireEvent.click(screen.getByRole('button', { name: '견적서 페이지로' }));
    expect(mockNavigate).toHaveBeenCalledWith('/estimate-detail', {
      state: { orderId: '77' },
    });
  });

  it('does not send duplicate confirm requests under StrictMode remounts', async () => {
    mockConfirmPayment.mockResolvedValue({
      amount: 11000,
      status: 'PAID',
    });

    render(
      <React.StrictMode>
        <MemoryRouter
          initialEntries={['/payment-success?paymentKey=ext-1&orderId=payment-uid&amount=11000']}
        >
          <Routes>
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
          </Routes>
        </MemoryRouter>
      </React.StrictMode>,
    );

    expect(await screen.findByText('결제가 완료되었습니다.')).toBeInTheDocument();
    expect(mockConfirmPayment).toHaveBeenCalledTimes(1);
    expect(mockConfirmPayment).toHaveBeenCalledWith({
      paymentUid: 'payment-uid',
      paymentKey: 'ext-1',
      amount: 11000,
    });
  });

  it('shows an error state when confirm fails', async () => {
    mockConfirmPayment.mockRejectedValue(new Error('confirm failed'));

    renderPage('/payment-success?paymentKey=ext-fail&orderId=payment-fail&amount=12000');

    expect(await screen.findByText('결제 승인에 실패했습니다.')).toBeInTheDocument();
    expect(screen.getByText('confirm failed')).toBeInTheDocument();
    expect(mockConfirmPayment).toHaveBeenCalledTimes(1);
  });
});
