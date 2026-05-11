import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import PartnerAcceptedPage from './PartnerAcceptedPage';
import { partnerapi } from '../../api/partnerapi';

// 자식 컴포넌트 및 API 모킹
vi.mock('../../api/apiClient', () => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('../../api/partnerapi', () => ({
  partnerapi: {
    getSelectedOrders: vi.fn(),
    getPartnerOrderDetail: vi.fn(),
  },
}));
vi.mock('../../components/Partner/PartnerSidebar', () => ({
  default: () => <div data-testid="mock-sidebar" />,
}));
vi.mock('../../components/Partner/PartnerFilterDropdown', () => ({
  default: () => <div data-testid="mock-dropdown" />,
}));
vi.mock('../../components/Partner/AcceptedTable', () => ({
  default: ({ orders, onSelectOrder, pagination }) => (
    <div
      data-testid="mock-accepted-table"
      data-orders-type={Array.isArray(orders) ? 'array' : typeof orders}
    >
      {Array.isArray(orders) ? orders.length : 'invalid'}
      <span>
        page:{pagination?.currentPage}/{pagination?.totalPages}
      </span>
      <button type="button" onClick={() => pagination?.onPageChange(2)}>
        page 2
      </button>
      {Array.isArray(orders) &&
        orders.map((order) => (
          <button key={order.orderId} type="button" onClick={() => onSelectOrder(order)}>
            select {order.orderId}
          </button>
        ))}
    </div>
  ),
}));
vi.mock('../../components/Partner/AcceptedOrderDetail', () => ({
  default: ({ selectedOrder }) => (
    <div data-testid="mock-accepted-order-detail">
      {selectedOrder
        ? `detail:${selectedOrder.orderId}/${selectedOrder.assetImageUrl}/${selectedOrder.assetUrl}`
        : 'empty'}
    </div>
  ),
}));

describe('PartnerAcceptedPage 페이지 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('페이지의 메인 타이틀과 상단 정보(의뢰 내역 개수, 새로고침 버튼)가 화면에 나타나야 합니다', async () => {
    // API 응답 모킹 (데이터 2건)
    vi.mocked(partnerapi.getSelectedOrders).mockResolvedValueOnce({
      isSuccess: true,
      data: {
        content: [{ orderId: 1 }, { orderId: 2 }],
        totalElements: 2,
        totalPages: 1,
        size: 20,
        number: 0,
      },
    });

    render(<PartnerAcceptedPage />);

    // 1. 메인 타이틀 검증
    expect(screen.getByText('의뢰 수락 목록')).toBeInTheDocument();

    // 2. 데이터 개수 검증 (💡 replaceAll 사용)
    await waitFor(() => {
      const countElement = screen.getByText((content, element) => {
        // 불필요한 부모 태그(body 등)까지 선택되는 것을 막기 위해 div 태그만 검사합니다.
        return (
          element?.tagName.toLowerCase() === 'div' &&
          element?.textContent.replaceAll(/\s+/g, '') === '의뢰내역:2건'
        );
      });
      expect(countElement).toBeInTheDocument();
    });

    // 3. 새로고침 버튼 검증
    expect(screen.getByRole('button', { name: /새로고침/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /견적서 발송/i })).not.toBeInTheDocument();
    expect(partnerapi.getSelectedOrders).toHaveBeenCalledWith({
      page: 0,
      size: 20,
      sort: 'createdAt,desc',
    });
  });

  it('페이지 응답의 content 배열을 AcceptedTable에 전달해야 합니다', async () => {
    vi.mocked(partnerapi.getSelectedOrders).mockResolvedValueOnce({
      isSuccess: true,
      data: {
        content: [{ orderId: 1 }, { orderId: 2 }],
        number: 0,
        size: 20,
        totalPages: 1,
        totalElements: 2,
      },
    });

    render(<PartnerAcceptedPage />);

    const table = await screen.findByTestId('mock-accepted-table');
    expect(table).toHaveAttribute('data-orders-type', 'array');
    expect(table).toHaveTextContent('2');
  });

  it('partner API service response data directly loads accepted orders', async () => {
    vi.mocked(partnerapi.getSelectedOrders).mockResolvedValueOnce({
      isSuccess: true,
      data: {
        content: [{ orderId: 10 }, { orderId: 11 }],
        totalElements: 2,
        totalPages: 1,
        size: 20,
        number: 0,
      },
    });

    render(<PartnerAcceptedPage />);

    await waitFor(() => {
      expect(partnerapi.getSelectedOrders).toHaveBeenCalledTimes(1);
    });

    const table = await screen.findByTestId('mock-accepted-table');
    expect(table).toHaveTextContent('2');
  });

  it('loads the order detail and shows accepted order detail below when an accepted order is selected', async () => {
    vi.mocked(partnerapi.getSelectedOrders).mockResolvedValueOnce({
      isSuccess: true,
      data: {
        content: [{ orderId: 21, requirements: 'paid order', status: 'PAYMENT_COMPLETED' }],
        totalElements: 1,
        totalPages: 1,
        size: 20,
        number: 0,
      },
    });
    vi.mocked(partnerapi.getPartnerOrderDetail).mockResolvedValueOnce({
      data: {
        orderId: 21,
        version: 7,
        quantity: 3,
        requirements: 'fresh paid order detail',
        assetImageUrl: 'https://files.example.com/preview.png',
        assetUrl: 'https://files.example.com/model.stl',
      },
    });

    render(<PartnerAcceptedPage />);

    fireEvent.click(await screen.findByText('select 21'));

    await waitFor(() => {
      expect(partnerapi.getPartnerOrderDetail).toHaveBeenCalledWith(21);
    });
    expect(
      await screen.findByText(
        'detail:21/https://files.example.com/preview.png/https://files.example.com/model.stl',
      ),
    ).toBeInTheDocument();
  });

  it('loads another selected order page when pagination changes', async () => {
    vi.mocked(partnerapi.getSelectedOrders).mockResolvedValue({
      isSuccess: true,
      data: {
        content: [{ orderId: 1 }],
        number: 0,
        size: 20,
        totalPages: 3,
        totalElements: 41,
      },
    });

    render(<PartnerAcceptedPage />);

    expect(await screen.findByText('page:1/3')).toBeInTheDocument();

    fireEvent.click(screen.getByText('page 2'));

    await waitFor(() => {
      expect(partnerapi.getSelectedOrders).toHaveBeenLastCalledWith({
        page: 1,
        size: 20,
        sort: 'createdAt,desc',
      });
    });
  });
});
