import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DeliveryFilter from './DeliveryFilter';

/**
 * DeliveryFilter 컴포넌트 유닛 테스트
 * 배송 처리 상태, 결제 방법 등 주요 필터 항목과 검색/초기화 버튼의 렌더링을 검증함
 */
describe('DeliveryFilter 컴포넌트 테스트', () => {
  it('모든 필터 카테고리와 검색/초기화 버튼이 정상적으로 화면에 나타나야 합니다', () => {
    render(<DeliveryFilter />);

    // 라벨 및 버튼 렌더링 확인
    expect(screen.getByText('처리상태')).toBeInTheDocument();
    expect(screen.getByText('결제방법')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '검색' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '초기화' })).toBeInTheDocument();
  });
});
