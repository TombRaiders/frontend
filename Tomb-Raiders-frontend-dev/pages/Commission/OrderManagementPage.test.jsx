import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { describe, test, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import OrderManagementPage from './OrderManagementPage';

// 1. useNavigate 모킹
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 2. 하위 컴포넌트 모킹
vi.mock('../../components/Commission/OrderListItem', () => ({
  default: ({ item, onDetail }) => (
    <div data-testid="order-item">
      <span>{item.title}</span>
      <button onClick={onDetail}>상세</button>
    </div>
  ),
}));

vi.mock('../../components/Commission/CreateAssetCard', () => ({
  default: () => <div data-testid="create-card">Create Asset</div>,
}));

describe('OrderManagementPage 통합 테스트 (Navigate Spy 방식)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 📍 윈도우 크기 확실히 보장
    vi.stubGlobal('innerWidth', 1920);
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    );
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <OrderManagementPage />
      </MemoryRouter>,
    );

  test('새 의뢰 만들기 카드 클릭 시 /commission으로 이동하는가?', async () => {
    renderPage();

    // 📍 클릭할 버튼을 더 안전하게 찾음
    const createCard = await screen.findByTestId('create-card');
    const button = createCard.closest('button');

    fireEvent.click(button);

    // 📍 결과 페이지 렌더링을 기다리는 대신 navigate 함수 호출을 확인
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/commission');
    });
  });

  test('상세 버튼 클릭 시 /payments/:id로 이동하는가?', async () => {
    renderPage();

    const detailBtn = await screen.findAllByText('상세');

    fireEvent.click(detailBtn[0]);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/payments\//),
        expect.any(Object),
      );
    });
  });
});
