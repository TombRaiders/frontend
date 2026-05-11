import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OrderTable from './OrderTable';

/**
 * OrderTable 컴포넌트 유닛 테스트
 * 주문 번호, 상태, 상품명 등 주문 내역 데이터가 올바르게 렌더링되는지 확인하며,
 * 특정 텍스트(주문번호)에 언더라인 스타일이 적용되어 있는지 검증함
 */
describe('OrderTable 컴포넌트 테스트', () => {
  // 테스트용 모의(Mock) 주문 데이터 정의
  const mockData = [
    {
      orderId: 'REQ-001',
      status: '의뢰신청',
      productName: '캐릭터 모델링',
    },
  ];

  it('주문 번호가 링크 스타일(언더라인)로 표시되고 상품명이 렌더링되어야 합니다', () => {
    render(<OrderTable data={mockData} />);

    // 주문번호 텍스트 추출 및 스타일 확인
    const orderIdCell = screen.getByText(/REQ-001/);
    expect(orderIdCell).toBeInTheDocument();
    expect(orderIdCell).toHaveClass('underline');

    // 상품명 렌더링 여부 확인
    expect(screen.getByText(/캐릭터 모델링/)).toBeInTheDocument();
  });
});
