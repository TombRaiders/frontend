import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import OrderListItem from './OrderListItem';
import * as authUtils from '../../utils/authUtils';

// 1. useNavigate 모킹
const { mockedUsedNavigate } = vi.hoisted(() => ({
  mockedUsedNavigate: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

// 📍 authUtils 모듈은 모킹하되, 내부 함수를 spyOn으로 가로챌 수 있게 실제를 가져옴
vi.mock('../../utils/authUtils', async () => {
  const actual = await vi.importActual('../../utils/authUtils');
  return {
    ...actual,
    getCookie: vi.fn(),
  };
});

describe('OrderListItem 컴포넌트 테스트', () => {
  const mockVw = (size) => `${size}px`;
  const mockItem = {
    id: '1',
    title: '테스트 피규어',
    status: 'QUOTED',
    style: '지브리',
    quantity: 2,
    img: 'test.jpg',
  };

  const mockProps = {
    item: mockItem,
    vw: mockVw,
    onDelete: vi.fn(),
    onDetail: vi.fn(),
    onQuoteCheck: vi.fn(),
    onOrderSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authUtils.getCookie).mockReturnValue([]);
  });

  test('결제 완료된 아이템(Cookie 존재)일 때 "결제 완료" UI가 표시되는가?', async () => {
    // 📍 spyOn 또는 mockReturnValue를 사용하여 해당 호출 시점에 데이터 반환
    vi.mocked(authUtils.getCookie).mockReturnValue([{ id: '1', title: '테스트 피규어' }]);

    render(
      <BrowserRouter>
        <OrderListItem {...mockProps} />
      </BrowserRouter>,
    );

    // 📍 상태 변경을 충분히 대기
    await waitFor(
      () => {
        expect(screen.getByText(/결제 완료/)).toBeInTheDocument();
        expect(screen.getByText('결제 상세 보기')).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  test('아이템 정보(제목, 스타일, 수량)가 올바르게 렌더링되는가?', () => {
    render(
      <BrowserRouter>
        <OrderListItem {...mockProps} />
      </BrowserRouter>,
    );

    expect(screen.getByText('테스트 피규어')).toBeInTheDocument();
    expect(screen.getByText(/스타일: 지브리/)).toBeInTheDocument();
    expect(screen.getByText(/수량: 2개/)).toBeInTheDocument();
  });

  test('상태가 QUOTED일 때 "견적서 도착" 상태 메시지와 버튼이 표시되는가?', () => {
    render(
      <BrowserRouter>
        <OrderListItem {...mockProps} />
      </BrowserRouter>,
    );

    expect(screen.getByText(/● 견적서 도착/)).toBeInTheDocument();
    expect(screen.getByText('견적서 확인')).toBeInTheDocument();
  });

  test('삭제 버튼 클릭 시 onDelete 함수가 id와 함께 호출되는가?', () => {
    render(
      <BrowserRouter>
        <OrderListItem {...mockProps} />
      </BrowserRouter>,
    );

    const deleteBtn = screen.getByText('삭제');
    fireEvent.click(deleteBtn);

    expect(mockProps.onDelete).toHaveBeenCalledWith('1');
  });

  test('카드 자체를 클릭했을 때 상태에 따라 올바른 경로로 navigate되는가?', () => {
    render(
      <BrowserRouter>
        <OrderListItem {...mockProps} />
      </BrowserRouter>,
    );

    const card = screen.getByText('테스트 피규어').closest('button');
    fireEvent.click(card);

    expect(mockProps.onQuoteCheck).toHaveBeenCalled();
  });
});
