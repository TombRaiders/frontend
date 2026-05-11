/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import ShippingManagementPage from './ShippingManagementPage';

expect.extend(matchers);

// 1. 하위 UI 컴포넌트 Mocking
vi.mock('../../components/Member/MemberEdit/EditTopNav', () => ({
  default: ({ onBack }) => (
    <div data-testid="mock-top-nav">
      <button onClick={onBack}>뒤로가기</button>
    </div>
  ),
}));

vi.mock('../../components/Member/MemberEdit/EditSidebar', () => ({
  default: ({ activeMenu }) => <div data-testid="mock-sidebar">현재 메뉴: {activeMenu}</div>,
}));

// 2. 스타일 및 API 서비스 Mocking
vi.mock('../../utils/style', () => ({
  vw: (size) => `${size}px`,
}));

// ShippingContent 내부에서 사용하는 API 서비스 모킹
vi.mock('../../api/addressService', () => ({
  addressService: {
    getAddresses: vi.fn(() => Promise.resolve({ data: [] })),
    deleteAddress: vi.fn(() => Promise.resolve()),
  },
}));

// 3. useNavigate Mocking
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('ShippingManagementPage 통합 테스트', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('기본 레이아웃(네비게이션, 사이드바, 컨텐츠박스)이 정상적으로 렌더링되어야 한다', async () => {
    render(
      <MemoryRouter>
        <ShippingManagementPage />
      </MemoryRouter>,
    );

    expect(await screen.findByTestId('mock-top-nav')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidebar')).toHaveTextContent('배송지관리');
    // ShippingContent 내의 타이틀이 보이는지 확인 (비동기 로드 대기)
    expect(await screen.findByText('배송지 주소록 관리')).toBeInTheDocument();
  });

  it('컨텐츠 박스가 디자인 가이드(600px, 하얀 배경)를 준수해야 한다', async () => {
    render(
      <MemoryRouter>
        <ShippingManagementPage />
      </MemoryRouter>,
    );

    // ShippingContent의 부모 div 찾기 (비동기 렌더링 대기)
    const contentBox = await screen.findByTestId('content-box');
    const style = globalThis.getComputedStyle(contentBox);

    expect(style.width).toBe('600px');
    expect(style.borderRadius).toBe('12px');
    expect(style.backgroundColor).toBe('rgb(255, 255, 255)');
  });

  it('뒤로가기 버튼 클릭 시 /Member 경로로 네비게이션이 발생해야 한다', async () => {
    render(
      <MemoryRouter>
        <ShippingManagementPage />
      </MemoryRouter>,
    );

    // 초기 비동기 데이터 로드가 완료될 때까지 대기하여 act() 경고 방지
    await screen.findByText('배송지 주소록 관리');

    const backBtn = screen.getByText('뒤로가기');
    await act(async () => {
      fireEvent.click(backBtn);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/Member');
  });
});
