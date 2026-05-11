import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DeliveryTable from './DeliveryTable';

/**
 * DeliveryTable 컴포넌트 유닛 테스트
 * 배송 데이터(주문번호, 상품명, 가격 등)가 테이블 형식에 맞춰 올바르게 표시되는지 확인하며,
 * 특정 텍스트의 스타일 적용 여부를 검증함
 */
describe('DeliveryTable 컴포넌트 테스트', () => {
  // 테스트용 샘플 배송 데이터 정의
  const mockData = [
    {
      orderId: 'ORD-123',
      status: '배송중',
      createdAt: '2026.03.04',
      sellerName: '판매자A',
      productName: '3D 피규어',
      totalPrice: '50,000원',
      paymentMethod: '카드',
    },
  ];

  it('배송 정보가 행(Row)으로 정상적으로 렌더링되어야 합니다', () => {
    render(<DeliveryTable data={mockData} />);

    // 주문번호 및 상품명 텍스트 유무 확인
    expect(screen.getByText('ORD-123')).toBeInTheDocument();
    expect(screen.getByText('3D 피규어')).toBeInTheDocument();

    // 가격 정보에 볼드 스타일이 적용되어 있는지 확인
    expect(screen.getByText('50,000원')).toHaveClass('font-bold');
  });
});
