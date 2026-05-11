import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import OrderListContent from './OrderListContent';

// 자식 컴포넌트 모킹 (컴포넌트 단위 테스트이므로 자식의 상세 로직은 분리)
vi.mock('./CreateAssetCard', () => ({
  default: () => <div data-testid="create-card">Create Asset Card</div>,
}));
vi.mock('./OrderListItem', () => ({
  default: ({ item }) => <div data-testid="order-item">{item.title}</div>,
}));

describe('OrderListContent 컴포넌트 테스트', () => {
  const mockVw = (size) => `${size}px`;

  beforeEach(() => {
    globalThis.innerWidth = 1920;
  });

  test('CreateAssetCard가 화면에 렌더링되는가?', () => {
    render(
      <BrowserRouter>
        <OrderListContent vw={mockVw} />
      </BrowserRouter>,
    );

    expect(screen.getByTestId('create-card')).toBeInTheDocument();
  });

  test('myOrders 데이터 개수만큼 OrderListItem이 렌더링되는가?', () => {
    render(
      <BrowserRouter>
        <OrderListContent vw={mockVw} />
      </BrowserRouter>,
    );

    // mockData에 '냥냥'과 '캐릭터 모델링' 두 개가 있으므로 2개가 나와야 함
    const orderItems = screen.getAllByTestId('order-item');
    expect(orderItems).toHaveLength(2);

    expect(screen.getByText('냥냥')).toBeInTheDocument();
    expect(screen.getByText('캐릭터 모델링')).toBeInTheDocument();
  });

  test('리스트 감싸는 영역(listWrapper)에 올바른 마진값이 적용되는가?', () => {
    render(
      <BrowserRouter>
        <OrderListContent vw={mockVw} />
      </BrowserRouter>,
    );

    // listWrapper 역할을 하는 div 찾기 (CreateAssetCard 다음의 형제 요소)
    const listWrapper = screen.getByTestId('create-card').nextSibling;
    expect(listWrapper).toHaveStyle('margin-top: 80px');
    expect(listWrapper).toHaveStyle('display: flex');
  });
});
