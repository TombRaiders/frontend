import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RequestTable from './RequestTable';

vi.mock('./PartnerPagination', () => ({
  default: () => <div data-testid="mock-pagination">Pagination</div>,
}));

describe('RequestTable 컴포넌트 테스트', () => {
  it('의뢰 신청 데이터 행(Row)과 각 상태별 액션 버튼들이 정상적으로 렌더링되어야 합니다', () => {
    const mockOrders = [
      {
        orderId: 1,
        memberId: 'user1',
        requirements: '고양이 만들어주세요',
        status: 'PENDING',
        createdAt: '2026-04-13T10:00:00',
      },
      {
        orderId: 2,
        memberId: 'user2',
        requirements: '욕설/혐오/차별',
        status: 'REJECTED',
        createdAt: '2026-04-13T11:00:00',
      },
    ];

    render(
      <RequestTable
        orders={mockOrders}
        onSelectOrder={vi.fn()}
        refreshOrders={vi.fn()}
        showAlert={vi.fn()}
        showConfirm={vi.fn()}
      />,
    );

    // 데이터 확인
    expect(screen.getByText('고양이 만들어주세요')).toBeInTheDocument();
    expect(screen.getByText('욕설/혐오/차별')).toBeInTheDocument();

    // 상태 배지 확인
    expect(screen.getByText('대기 중')).toBeInTheDocument();
    expect(screen.getByText('취소/거절')).toBeInTheDocument();
  });

  it('REQUESTED 상태 주문은 수락과 거절 버튼을 사용할 수 있어야 합니다', () => {
    render(
      <RequestTable
        orders={[
          {
            orderId: 1,
            memberId: 'user1',
            requirements: '고양이 만들어주세요',
            status: 'REQUESTED',
            createdAt: '2026-04-13T10:00:00',
          },
        ]}
        onSelectOrder={vi.fn()}
        refreshOrders={vi.fn()}
        showAlert={vi.fn()}
        showConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText('견적대기')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '수락' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '거절' })).toBeEnabled();
  });
});
