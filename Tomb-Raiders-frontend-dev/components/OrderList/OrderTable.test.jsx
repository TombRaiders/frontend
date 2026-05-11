import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import OrderTable from './OrderTable';

describe('OrderTable 컴포넌트 테스트', () => {
  const mockOrders = [
    {
      id: 'ORD-001',
      title: '강아지 피규어',
      img: 'dog.jpg',
      status: 'COMPLETED',
      price: 50000,
      qty: 1,
    },
    {
      id: 'ORD-002',
      title: '고양이 인형',
      img: 'cat.jpg',
      status: 'PENDING',
      price: 30000,
      qty: 2,
    },
    {
      id: 'ORD-003',
      title: '캐릭터 굿즈',
      img: 'char.jpg',
      assetImagePath: 'asset-thumb.jpg',
      status: 'SHIPPED',
      price: 15000,
      qty: 3,
    },
  ];

  const mockOnOrderClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('innerWidth', 1920); // vw 계산용
  });

  test('PENDING 상태인 주문은 목록에서 제외하고 렌더링하는가?', () => {
    render(<OrderTable orders={mockOrders} onOrderClick={mockOnOrderClick} />);

    // COMPLETED와 SHIPPED는 존재해야 함
    expect(screen.getByText('강아지 피규어')).toBeInTheDocument();
    expect(screen.getByText('캐릭터 굿즈')).toBeInTheDocument();

    // PENDING 상태인 '고양이 인형'은 없어야 함
    expect(screen.queryByText('고양이 인형')).not.toBeInTheDocument();
  });

  test('금액이 콤마가 포함된 원화 형식으로 표시되는가?', () => {
    render(<OrderTable orders={mockOrders} onOrderClick={mockOnOrderClick} />);

    // 50000 -> 50,000원
    expect(screen.getByText('50,000원')).toBeInTheDocument();
    // 15000 -> 15,000원
    expect(screen.getByText('15,000원')).toBeInTheDocument();
  });

  test('주문번호나 상세보기 버튼 클릭 시 onOrderClick 함수가 호출되는가?', () => {
    render(<OrderTable orders={mockOrders} onOrderClick={mockOnOrderClick} />);

    // 주문번호(ID) 클릭
    const orderId = screen.getByText('ORD-001');
    fireEvent.click(orderId);
    expect(mockOnOrderClick).toHaveBeenCalledWith(mockOrders[0]);

    // 상세보기 버튼 클릭 (두 번째로 렌더링된 ORD-003 항목의 버튼)
    const detailBtns = screen.getAllByText('상세보기');
    fireEvent.click(detailBtns[1]); // ORD-003의 버튼
    expect(mockOnOrderClick).toHaveBeenCalledWith(mockOrders[2]);
  });

  test('이미지에 올바른 src와 alt 속성이 적용되어 있는가?', () => {
    render(<OrderTable orders={mockOrders} onOrderClick={mockOnOrderClick} />);

    const images = screen.getAllByAltText('thumb');
    expect(images[0]).toHaveAttribute('src', 'dog.jpg');
    expect(images[1]).toHaveAttribute('src', 'asset-thumb.jpg');
  });
});
