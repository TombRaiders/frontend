import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AcceptedTable from './AcceptedTable';

// 하위 컴포넌트 모킹
vi.mock('./PartnerPagination', () => ({
  default: () => <div data-testid="mock-pagination">Pagination</div>,
}));

describe('AcceptedTable 컴포넌트 테스트', () => {
  const mockOnSelectionChange = vi.fn();

  it('1. 테이블의 주요 헤더 항목들이 정상적으로 렌더링되어야 합니다', () => {
    render(<AcceptedTable onSelectionChange={mockOnSelectionChange} />);

    // 수정된 헤더명 적용
    expect(screen.getByText('의뢰 번호')).toBeInTheDocument();
    expect(screen.getByText('의뢰자 ID')).toBeInTheDocument();
    expect(screen.getByText('의뢰 내용')).toBeInTheDocument();
    expect(screen.getByText('진행 상태')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-pagination')).not.toBeInTheDocument();
  });

  it('2. 프롭스로 전달된 데이터가 올바르게 표시되어야 합니다', () => {
    const mockOrders = [
      { orderId: 1, memberId: 'user1', requirements: '고양이', status: 'PAYMENT_COMPLETED' },
      { orderId: 2, memberId: 'user3', requirements: '돼지불고기', status: 'PENDING' },
    ];

    render(<AcceptedTable orders={mockOrders} onSelectionChange={mockOnSelectionChange} />);

    // 데이터 표시 확인
    expect(screen.getByText('고양이')).toBeInTheDocument();
    expect(screen.getByText('결제 완료')).toBeInTheDocument();
    expect(screen.getByText('돼지불고기')).toBeInTheDocument();
    expect(screen.getByText('대기 중')).toBeInTheDocument();
  });

  it('clicks an accepted order row without mixing it with checkbox selection', () => {
    const handleSelectOrder = vi.fn();
    const handleSelectionChange = vi.fn();
    const mockOrders = [
      { orderId: 21, memberId: 'user21', requirements: 'paid order', status: 'PAYMENT_COMPLETED' },
    ];

    render(
      <AcceptedTable
        orders={mockOrders}
        selectedOrder={{ orderId: 21 }}
        selectedOrderIds={[]}
        onSelectOrder={handleSelectOrder}
        onSelectionChange={handleSelectionChange}
      />,
    );

    fireEvent.click(screen.getByText('paid order').closest('tr'));

    expect(handleSelectOrder).toHaveBeenCalledWith(mockOrders[0]);

    fireEvent.click(screen.getAllByRole('checkbox')[1]);

    expect(handleSelectionChange).toHaveBeenCalledWith([21]);
    expect(handleSelectOrder).toHaveBeenCalledTimes(1);
  });

  it('페이지 정보가 있으면 페이지네이션을 표시해야 합니다', () => {
    render(
      <AcceptedTable
        orders={[{ orderId: 1, memberId: 'user1', requirements: '고양이', status: 'PAID' }]}
        onSelectionChange={mockOnSelectionChange}
        pagination={{
          currentPage: 1,
          totalPages: 2,
          onPageChange: vi.fn(),
        }}
      />,
    );

    expect(screen.getByTestId('mock-pagination')).toBeInTheDocument();
  });
});
