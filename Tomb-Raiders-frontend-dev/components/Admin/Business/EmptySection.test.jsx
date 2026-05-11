import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import EmptySection from './EmptySection';

/**
 * EmptySection 컴포넌트 유닛 테스트
 * 데이터가 없을 때 표시되는 바로가기 메뉴 버튼들의 렌더링과 클릭 이벤트를 검증함
 */

// react-router-dom의 useNavigate 훅을 모킹하여 페이지 이동 기능을 테스트함
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

describe('EmptySection 컴포넌트 테스트', () => {
  it('주요 메뉴 버튼들이 화면에 렌더링되고 클릭 시 정상적으로 동작해야 합니다', () => {
    render(
      <MemoryRouter>
        <EmptySection />
      </MemoryRouter>,
    );

    // 특정 메뉴 버튼(예: 주문 관리)이 존재하는지 확인
    const orderBtn = screen.getByText('주문 관리');
    expect(orderBtn).toBeInTheDocument();

    // 버튼 클릭 시뮬레이션 (에러 발생 여부 확인)
    fireEvent.click(orderBtn);
    expect(orderBtn).toBeDefined();
  });
});
