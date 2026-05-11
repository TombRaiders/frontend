import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import SuccessPage from './SuccessPage';
import '@testing-library/jest-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate, // navigate 호출 시 mockNavigate가 실행됨
  };
});

describe('SuccessPage 컴포넌트 테스트', () => {
  const mockOrder = { id: 'ORD-123', title: '커스텀 피규어' };

  test('"홈으로 이동" 버튼 클릭 시 navigate("/")가 호출되는가?', () => {
    render(
      <MemoryRouter initialEntries={[{ state: { order: mockOrder } }]}>
        <SuccessPage />
      </MemoryRouter>,
    );

    const homeBtn = screen.getByText('홈으로 이동');
    fireEvent.click(homeBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('order 데이터가 있을 때 상세페이지로 이동하는가?', () => {
    render(
      <MemoryRouter initialEntries={[{ state: { order: mockOrder } }]}>
        <SuccessPage />
      </MemoryRouter>,
    );

    const detailBtn = screen.getByText('주문 상세 내역 보기');
    fireEvent.click(detailBtn);

    // 📍 호출된 경로와 전달된 state까지 한 번에 검증
    expect(mockNavigate).toHaveBeenCalledWith(`/payments/${mockOrder.id}`, {
      state: { order: mockOrder },
    });
  });

  test('order 데이터가 없을 때 목록으로 리다이렉트 되는가?', () => {
    // state 없이 렌더링
    render(
      <MemoryRouter initialEntries={[{ state: null }]}>
        <SuccessPage />
      </MemoryRouter>,
    );

    const detailBtn = screen.getByText('주문 상세 내역 보기');
    fireEvent.click(detailBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/payments/history');
  });
});
