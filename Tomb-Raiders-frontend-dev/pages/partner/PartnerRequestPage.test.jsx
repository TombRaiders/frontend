import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import PartnerRequestPage from './PartnerRequestPage';
import { partnerapi } from '../../api/partnerapi';

vi.mock('../../api/partnerapi', () => ({
  partnerapi: {
    getPartnerOrders: vi.fn(),
    getPartnerOrderDetail: vi.fn(),
    getPartnerInfo: vi.fn(),
  },
}));

vi.mock('../../hooks/usePartnerModals', () => ({
  usePartnerModals: () => ({
    showAlert: vi.fn(),
    showConfirm: vi.fn(),
    PartnerModals: null,
  }),
}));

vi.mock('../../components/Partner/PartnerSidebar', () => ({
  default: () => <div data-testid="mock-sidebar" />,
}));

vi.mock('../../components/Partner/RequestTable', () => ({
  default: ({ orders, onSelectOrder, pagination }) => (
    <div>
      <button onClick={() => onSelectOrder(orders[0])}>select first</button>
      <button onClick={() => pagination?.onPageChange(2)}>page 2</button>
      <span>
        page:{pagination?.currentPage}/{pagination?.totalPages}
      </span>
    </div>
  ),
}));

vi.mock('../../components/Partner/EstimateSection', () => ({
  default: ({ selectedOrder }) => (
    <div>
      {selectedOrder ? `selected:${selectedOrder.orderId}/${selectedOrder.version}` : 'empty'}
    </div>
  ),
}));

describe('PartnerRequestPage', () => {
  it('loads partner orders and merges the fresh order detail into the selected order', async () => {
    vi.mocked(partnerapi.getPartnerOrders).mockResolvedValue({
      isSuccess: true,
      data: {
        content: [{ orderId: 1, requirements: 'test order' }],
        number: 0,
        size: 10,
        totalPages: 2,
        totalElements: 11,
      },
    });
    vi.mocked(partnerapi.getPartnerInfo).mockResolvedValue({
      data: { name: 'Partner A' },
    });
    vi.mocked(partnerapi.getPartnerOrderDetail).mockResolvedValue({
      data: { orderId: 1, version: 4, quantity: 2 },
    });

    render(<PartnerRequestPage />);

    expect(await screen.findByText('주문 목록 : 11건')).toBeInTheDocument();
    expect(screen.getByText('page:1/2')).toBeInTheDocument();
    expect(partnerapi.getPartnerOrders).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      sort: ['createdAt,desc'],
      status: 'REQUESTED',
    });

    fireEvent.click(screen.getByText('select first'));

    await waitFor(() => {
      expect(partnerapi.getPartnerOrderDetail).toHaveBeenCalledWith(1);
    });
    expect(await screen.findByText('selected:1/4')).toBeInTheDocument();
  });

  it('loads another partner order page when pagination changes', async () => {
    vi.mocked(partnerapi.getPartnerOrders).mockResolvedValue({
      data: {
        content: [{ orderId: 1, requirements: 'test order' }],
        page: {
          number: 0,
          size: 10,
          totalPages: 3,
          totalElements: 21,
        },
      },
    });
    vi.mocked(partnerapi.getPartnerInfo).mockResolvedValue({
      data: { name: 'Partner A' },
    });

    render(<PartnerRequestPage />);

    expect(await screen.findByText('page:1/3')).toBeInTheDocument();

    fireEvent.click(screen.getByText('page 2'));

    await waitFor(() => {
      expect(partnerapi.getPartnerOrders).toHaveBeenLastCalledWith({
        page: 1,
        size: 10,
        sort: ['createdAt,desc'],
        status: 'REQUESTED',
      });
    });
  });

  it('uses top-level Spring page metadata when partner orders are not wrapped in a page object', async () => {
    vi.mocked(partnerapi.getPartnerOrders).mockResolvedValue({
      content: [{ orderId: 7, requirements: 'spring page order' }],
      number: 1,
      size: 10,
      totalPages: 4,
      totalElements: 31,
    });
    vi.mocked(partnerapi.getPartnerInfo).mockResolvedValue({
      data: { name: 'Partner A' },
    });

    render(<PartnerRequestPage />);

    expect(await screen.findByText('주문 목록 : 31건')).toBeInTheDocument();
    expect(screen.getByText('page:2/4')).toBeInTheDocument();
  });

  it('reloads partner orders with the selected request status', async () => {
    vi.mocked(partnerapi.getPartnerOrders).mockResolvedValue({
      data: {
        content: [{ orderId: 1, requirements: 'paid order', status: 'PAID' }],
        page: {
          number: 0,
          size: 10,
          totalPages: 1,
          totalElements: 1,
        },
      },
    });
    vi.mocked(partnerapi.getPartnerInfo).mockResolvedValue({
      data: { name: 'Partner A' },
    });

    render(<PartnerRequestPage />);

    expect(await screen.findByText('page:1/1')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('의뢰 상태'), { target: { value: 'PAID' } });

    await waitFor(() => {
      expect(partnerapi.getPartnerOrders).toHaveBeenLastCalledWith({
        page: 0,
        size: 10,
        sort: ['createdAt,desc'],
        status: 'PAID',
      });
    });
  });
});
