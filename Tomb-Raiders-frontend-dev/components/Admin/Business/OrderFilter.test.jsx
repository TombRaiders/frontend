import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OrderFilter from './OrderFilter';

/**
 * OrderFilter 컴포넌트 유닛 테스트
 * 주문 기간 설정, 날짜 입력창, 기간 선택 버튼 등 상세 필터링 항목의 렌더링을 검증함
 */
describe('OrderFilter 컴포넌트 테스트', () => {
  it('기간 필터의 날짜 입력창과 기간 선택 버튼들이 정상적으로 렌더링되어야 합니다', () => {
    render(<OrderFilter />);

    // 시작 및 종료 날짜 입력창(Placeholder 기준) 확인
    expect(screen.getAllByPlaceholderText('2026.00.00')).toHaveLength(2);

    // 기간 대안 버튼 중 하나(예: 1개월)가 화면에 나타나는지 확인
    expect(screen.getByText('1개월')).toBeInTheDocument();
  });
});
