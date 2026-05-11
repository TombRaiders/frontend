import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import EditTopNav from './EditTopNav';

/**
 * EditTopNav 컴포넌트 유닛 테스트
 * 회원 정보 수정 페이지 상단바의 검색창 스타일과 뒤로가기 버튼 클릭 시의 마이페이지 메인 이동 기능을 검증함
 */

// 1. 라우팅 기능 모킹
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockVw = (size) => `${size}px`;

describe('EditTopNav 컴포넌트 테스트', () => {
  // 각 테스트 종료 후 DOM 상태 및 모킹 기록을 초기화함
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('검색 입력창이 테두리 없는 흰색 배경으로 정상적으로 렌더링되어야 합니다', () => {
    render(
      <MemoryRouter>
        <EditTopNav vw={mockVw} />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText('검색');

    // 배경색 확인
    expect(searchInput).toHaveStyle('background-color: rgb(255, 255, 255)');

    // 테두리 스타일(없음/0px) 확인
    const style = globalThis.getComputedStyle(searchInput);
    expect(style.borderWidth === '0px' || style.borderStyle === 'none').toBe(true);
  });

  it('뒤로가기(<) 버튼 클릭 시 마이페이지 메인(/Member)으로 이동해야 합니다', () => {
    render(
      <MemoryRouter>
        <EditTopNav vw={mockVw} />
      </MemoryRouter>,
    );

    // 뒤로가기 버튼 클릭 시뮬레이션
    const backButton = screen.getByText('<');
    fireEvent.click(backButton);

    // 경로 이동 함수 호출 여부 확인
    expect(mockNavigate).toHaveBeenCalledWith('/Member');
  });

  it('shows the stored current user profile image in the top-right circle', () => {
    sessionStorage.setItem(
      'currentUserProfile',
      JSON.stringify({ profileImageUrl: 'https://cdn.example.com/edit-profile.png' }),
    );

    const { container } = render(
      <MemoryRouter>
        <EditTopNav vw={mockVw} />
      </MemoryRouter>,
    );

    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://cdn.example.com/edit-profile.png',
    );
  });

  it('opens the profile menu when the top-right profile image is clicked', () => {
    sessionStorage.setItem(
      'currentUserProfile',
      JSON.stringify({ profileImageUrl: 'https://cdn.example.com/edit-profile.png' }),
    );

    render(
      <MemoryRouter>
        <EditTopNav vw={mockVw} />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '프로필 메뉴 토글' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '개인 페이지' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '정보 관리' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '로그아웃' })).toBeInTheDocument();
  });
});
