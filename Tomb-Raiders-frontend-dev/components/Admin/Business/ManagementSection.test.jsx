import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ManagementSection from './ManagementSection';

/**
 * ManagementSection 컴포넌트 유닛 테스트
 * 정산 관리 및 취소/반품/교환 현황 요약 카드의 렌더링 여부와 초기값(0원) 표시를 검증함
 */
describe('ManagementSection 컴포넌트 테스트', () => {
  it('정산 관리와 취소/반품/교환 섹션이 각각 화면에 나타나야 합니다', () => {
    render(<ManagementSection />);

    // 각 섹션 타이틀 유무 확인
    expect(screen.getByText('정산 관리')).toBeInTheDocument();
    expect(screen.getByText('취소 · 반품 · 교환')).toBeInTheDocument();

    // 정산 수치 초기화(0원) 항목의 개수가 부합하는지 확인
    expect(screen.getAllByText('0원')).toHaveLength(2);
  });
});
