import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PaymentPage from './PaymentPage';
import { usePayment } from './usePayment';
import { addressService } from '../../api/addressService';
import { orderapi } from '../../api/orderapi';

vi.mock('./usePayment', () => ({
  usePayment: vi.fn(),
}));

vi.mock('../../api/addressService', () => ({
  addressService: {
    getAddresses: vi.fn(),
  },
}));

vi.mock('../../api/orderapi', () => ({
  orderapi: {
    getOrderDetail: vi.fn(),
    getOrders: vi.fn(),
  },
}));

vi.mock('../../components/Member/MemberShippingMg/ShippingAddressModal', () => ({
  default: () => <div data-testid="shipping-modal" />,
}));

vi.mock('../../components/Payment/PaymentAddress', () => ({
  default: ({ address }) => <div>{address ? address.receiverName : 'no-address'}</div>,
}));

vi.mock('../../components/Payment/PaymentItemInfo', () => ({
  default: ({ itemName }) => <div>{itemName}</div>,
}));

vi.mock('../../components/Payment/PaymentSummary', () => ({
  default: ({ price, shippingFee }) => <div>{price + shippingFee}</div>,
}));

describe('PaymentPage', () => {
  const mockStartPayment = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.spyOn(globalThis, 'alert').mockImplementation(() => {});

    vi.mocked(usePayment).mockReturnValue({
      startPayment: mockStartPayment,
      isLoading: false,
    });

    vi.mocked(addressService.getAddresses).mockResolvedValue({
      data: [
        {
          addressId: 11,
          recipientName: 'Alice',
          recipientPhone: '01012345678',
          addressCode: '12345',
          address: 'Seoul',
          detailAddress: '101',
          isDefault: true,
        },
      ],
    });
  });

  const renderPage = (initialEntry) =>
    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/order/:orderId/payment" element={<PaymentPage />} />
        </Routes>
      </MemoryRouter>,
    );

  it('starts payment with the restored estimate context and legacy success/fail URLs', async () => {
    mockStartPayment.mockResolvedValue({ success: true, paymentUid: 'payment-1' });

    renderPage({
      pathname: '/payment',
      state: {
        order: {
          orderId: 77,
          commissionId: 88,
          img: 'item.png',
          title: 'Custom figure',
          status: 'REQUESTED',
        },
        estimateData: {
          quotationId: 901,
          itemName: 'Custom figure',
          price: 10000,
          shippingFee: 3000,
          commissionId: 88,
        },
      },
    });

    fireEvent.click(await screen.findByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: '13,000원 결제하기' }));

    await waitFor(() => {
      expect(mockStartPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 77,
          quotationId: 901,
          amount: 13000,
          orderName: 'Custom figure',
          customerName: 'Alice',
          successUrl: expect.stringContaining('/payment-success'),
          failUrl: expect.stringContaining('/payment-fail'),
          context: expect.objectContaining({
            orderId: 77,
            quotationId: 901,
            commissionId: 88,
          }),
        }),
      );
    });
  });

  it('restores payment entry from session storage when location state is missing', async () => {
    sessionStorage.setItem(
      'payment-entry:last',
      JSON.stringify({
        order: { orderId: 55, commissionId: 12, title: 'Restored order' },
        estimateData: {
          quotationId: 601,
          itemName: 'Restored order',
          price: 5000,
          shippingFee: 0,
          commissionId: 12,
        },
      }),
    );

    renderPage('/payment');

    expect(await screen.findByText('Restored order')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5,000원 결제하기' })).toBeInTheDocument();
  });

  it('restores payment data from pageable order responses', async () => {
    vi.mocked(orderapi.getOrderDetail).mockResolvedValueOnce(null);
    vi.mocked(orderapi.getOrders).mockResolvedValueOnce({
      data: {
        content: [
          {
            orderId: 20,
            status: 'REQUESTED',
            requirements: '의뢰 #33',
            quotations: [{ quotationId: 8, price: 13000, selected: true }],
          },
        ],
      },
    });

    renderPage('/order/20/payment');

    expect(await screen.findByText('의뢰 #33')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '13,000원 결제하기' })).toBeInTheDocument();
  });

  it('disables payment when the order is already paid', async () => {
    renderPage({
      pathname: '/payment',
      state: {
        order: {
          orderId: 20,
          commissionId: 33,
          title: 'Paid order',
          status: 'PAID',
        },
        estimateData: {
          quotationId: 8,
          itemName: 'Paid order',
          price: 13000,
          shippingFee: 0,
          commissionId: 33,
        },
      },
    });

    fireEvent.click(await screen.findByRole('checkbox'));

    expect(screen.getByRole('button', { name: '결제할 수 없는 주문입니다' })).toBeDisabled();
    expect(mockStartPayment).not.toHaveBeenCalled();
  });
});
