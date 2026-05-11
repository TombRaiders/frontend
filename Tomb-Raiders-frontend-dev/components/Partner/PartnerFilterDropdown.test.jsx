import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PartnerFilterDropdown from './PartnerFilterDropdown';

describe('PartnerFilterDropdown 컴포넌트 테스트', () => {
  it('필터 버튼을 클릭하면 숨겨져 있던 드롭다운 메뉴 항목들이 화면에 나타나야 합니다', () => {
    render(<PartnerFilterDropdown onFilterChange={vi.fn()} />);

    // 버튼 클릭하여 열기
    fireEvent.click(screen.getByText('모든 의뢰 내역'));

    // 변경된 상태 텍스트로 검증
    expect(screen.getByText('견적대기')).toBeInTheDocument();
    expect(screen.getByText('결제 완료')).toBeInTheDocument();
  });

  it('개별 메뉴 항목을 클릭하면 해당 필터로 갱신되고 드롭다운 메뉴가 자동으로 닫혀야 합니다', () => {
    const mockOnFilterChange = vi.fn();
    render(<PartnerFilterDropdown onFilterChange={mockOnFilterChange} />);

    fireEvent.click(screen.getByText('모든 의뢰 내역'));

    // '견적대기' 클릭
    fireEvent.click(screen.getByText('견적대기'));

    expect(mockOnFilterChange).toHaveBeenCalledWith('REQUESTED');
    expect(screen.queryByText('결제 완료')).not.toBeInTheDocument(); // 메뉴가 닫혔는지 확인
  });
});
