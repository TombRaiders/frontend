import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PartnerTableLayout from './PartnerTableLayout';

// 💡 하단 페이지네이션 컴포넌트 모킹
vi.mock('./PartnerPagination', () => ({
  default: () => <div data-testid="mock-pagination">Pagination</div>,
}));

describe('PartnerTableLayout 컴포넌트 테스트', () => {
  // 공통으로 사용할 가짜 헤더
  const mockHeaders = (
    <>
      <th>테스트 헤더 1</th>
      <th>테스트 헤더 2</th>
    </>
  );

  it('1. 로딩 상태(isLoading=true)일 때 "로딩 중..." 텍스트를 표시해야 합니다.', () => {
    render(
      <PartnerTableLayout
        columnsCount={2}
        headers={mockHeaders}
        isLoading
        isEmpty={false}
        emptyMessage="데이터가 없습니다."
      >
        <tr>
          <td>실제 데이터 1</td>
        </tr>
      </PartnerTableLayout>,
    );

    // 로딩 메시지는 보이고, 실제 데이터는 보이지 않아야 함
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    expect(screen.queryByText('실제 데이터 1')).not.toBeInTheDocument();
  });

  it('2. 데이터가 비어있을 때(isEmpty=true) 전달받은 emptyMessage를 표시해야 합니다.', () => {
    render(
      <PartnerTableLayout
        columnsCount={2}
        headers={mockHeaders}
        isLoading={false}
        isEmpty
        emptyMessage="수락된 의뢰 내역이 없습니다."
      >
        <tr>
          <td>실제 데이터 1</td>
        </tr>
      </PartnerTableLayout>,
    );

    // 빈 화면 메시지는 보이고, 실제 데이터는 보이지 않아야 함
    expect(screen.getByText('수락된 의뢰 내역이 없습니다.')).toBeInTheDocument();
    expect(screen.queryByText('실제 데이터 1')).not.toBeInTheDocument();
  });

  it('3. 로딩 중이 아니고 데이터가 있을 때 정상적으로 자식 요소(children)를 렌더링해야 합니다.', () => {
    render(
      <PartnerTableLayout
        columnsCount={2}
        headers={mockHeaders}
        isLoading={false}
        isEmpty={false}
        emptyMessage="데이터가 없습니다."
      >
        <tr>
          <td>실제 데이터 1</td>
          <td>실제 데이터 2</td>
        </tr>
      </PartnerTableLayout>,
    );

    // 실제 데이터가 렌더링되어야 하며, 로딩/빈 화면 메시지는 없어야 함
    expect(screen.getByText('실제 데이터 1')).toBeInTheDocument();
    expect(screen.getByText('실제 데이터 2')).toBeInTheDocument();
    expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
    expect(screen.queryByText('데이터가 없습니다.')).not.toBeInTheDocument();
  });

  it('4. 테이블 헤더와 하단 페이지네이션은 페이지가 2개 이상일 때 렌더링되어야 합니다.', () => {
    render(
      <PartnerTableLayout
        columnsCount={2}
        headers={mockHeaders}
        isLoading={false}
        isEmpty={false}
        emptyMessage="데이터가 없습니다."
        pagination={{
          currentPage: 1,
          totalPages: 2,
          onPageChange: vi.fn(),
        }}
      />,
    );

    // 헤더와 페이지네이션 모의(Mock) 요소가 존재하는지 확인
    expect(screen.getByText('테스트 헤더 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 헤더 2')).toBeInTheDocument();
    expect(screen.getByTestId('mock-pagination')).toBeInTheDocument();
  });

  it('5. 페이지가 1개뿐이면 페이지네이션을 렌더링하지 않아야 합니다.', () => {
    render(
      <PartnerTableLayout
        columnsCount={2}
        headers={mockHeaders}
        isLoading={false}
        isEmpty={false}
        emptyMessage="데이터가 없습니다."
        pagination={{
          currentPage: 1,
          totalPages: 1,
          onPageChange: vi.fn(),
        }}
      />,
    );

    expect(screen.queryByTestId('mock-pagination')).not.toBeInTheDocument();
  });
});
