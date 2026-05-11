import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PartnerPagination from './PartnerPagination';

/**
 * PartnerPagination 컴포넌트 유닛 테스트
 * 페이지네이션의 이전/다음 화살표 버튼과 현재 페이지 번호(1)의 렌더링 여부를 검증함
 */

// 스타일 유틸리티(vw) 모킹
vi.mock('../../utils/style', () => ({
  vw: (val) => `${val}vw`,
}));

describe('PartnerPagination 컴포넌트 테스트', () => {
  it('이전(<)/다음(>) 버튼과 기본 페이지 번호가 정상적으로 렌더링되어야 합니다', () => {
    render(<PartnerPagination />);

    // 화살표 버튼 및 숫자 1 유무 확인
    expect(screen.getByText('<')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('>')).toBeInTheDocument();
  });

  it('페이지 번호와 다음 버튼 클릭 시 onPageChange를 호출해야 합니다', () => {
    const onPageChange = vi.fn();
    render(<PartnerPagination currentPage={1} totalPages={3} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole('button', { name: '2' }));
    expect(onPageChange).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByRole('button', { name: '>' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
