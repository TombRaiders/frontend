import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * Sidebar 컴포넌트 유닛 테스트
 * 어드민 사이드바의 메뉴 렌더링, 현재 경로에 따른 활성화 스타일 적용, 그리고 메뉴 클릭 시의 라우팅 동작을 검증함
 */

// 1. react-router-dom 의존성 모킹: useNavigate를 추가하여 에러 해결!
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(),
  useNavigate: () => mockNavigate, // 컴포넌트가 렌더링될 때 사용할 가짜 navigate 함수
}));

// 2. 라우팅 관련 전역 함수 모킹: 실제 페이지 이동 대신 호출 여부만 감시(spy)함
const mockGoToMember = vi.fn();
const mockGoToBulletinBoard = vi.fn();

vi.mock('../../router', () => ({
  useRouterFunctions: () => ({
    goToMember: mockGoToMember,
    goToBulletinBoard: mockGoToBulletinBoard,
  }),
}));

// 3. 스타일 및 공통 컴포넌트 모킹: 테스트 실행 시의 부수적인 에러를 방지하고 속도를 향상시킴
vi.mock('../../utils/style', () => ({
  vw: (val) => `${val}vw`,
}));

vi.mock('../Logo/Logo', () => ({
  default: () => <div data-testid="mock-logo">Logo</div>,
}));

describe('Sidebar 컴포넌트 테스트', () => {
  // 각 테스트 실행 전 모킹된 함수들의 호출 기록을 초기화함
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear(); // 💡 navigate 호출 기록도 함께 초기화
  });

  it('사이드바의 로고와 모든 관리 메뉴 항목들이 화면에 정상적으로 렌더링되어야 합니다', () => {
    // 기본 경로('/') 상태에서 렌더링 확인
    useLocation.mockReturnValue({ pathname: '/' });
    render(<Sidebar />);

    expect(screen.getByTestId('mock-logo')).toBeInTheDocument();
    expect(screen.getByText('비지니스 매니저')).toBeInTheDocument();
    expect(screen.getByText('사용자 관리')).toBeInTheDocument();
    expect(screen.getByText('커뮤니티 설정')).toBeInTheDocument();
    expect(screen.getByText('신고 내역')).toBeInTheDocument();
  });

  it('현재 주소(pathname)와 일치하는 메뉴 항목에 활성화 스타일(검정색 및 밑줄)이 적용되어야 합니다', () => {
    // 사용자 관리(/member) 경로인 경우를 가정함
    useLocation.mockReturnValue({ pathname: '/member' });
    render(<Sidebar />);

    const activeMenu = screen.getByText('사용자 관리');
    const inactiveMenu = screen.getByText('커뮤니티 설정');

    // 활성 메뉴: 검정색 텍스트와 밑줄 유무 확인
    expect(activeMenu.className).toContain('text-black');
    expect(activeMenu.className).toContain('underline');

    // 비활성 메뉴: 기본 흰색 텍스트 유지 확인
    expect(inactiveMenu.className).not.toContain('text-black');
    expect(inactiveMenu.className).toContain('text-white');
  });

  it('각 메뉴 클릭 시 미리 정의된 라우팅 함수들이 올바르게 호출되어야 합니다', () => {
    useLocation.mockReturnValue({ pathname: '/' });
    render(<Sidebar />);

    // 사용자 관리 클릭 테스트
    fireEvent.click(screen.getByText('사용자 관리'));
    expect(mockGoToMember).toHaveBeenCalledTimes(1);

    // 커뮤니티 설정 클릭 테스트
    fireEvent.click(screen.getByText('커뮤니티 설정'));
    expect(mockGoToBulletinBoard).toHaveBeenCalledTimes(1);
  });

  // 💡 여기서부터 수정된 부분입니다!
  it('비지니스 매니저 메뉴 클릭 시 전역 경로(location.href)가 의도한 주소로 변경되어야 합니다', () => {
    useLocation.mockReturnValue({ pathname: '/' });
    render(<Sidebar />);

    // 버튼 클릭 시뮬레이션
    fireEvent.click(screen.getByText('비지니스 매니저'));

    // 💡 강제로 주소를 바꾸는 location.href 대신, React Router의 navigate 함수가 올바른 주소로 호출되었는지 검증합니다.
    expect(mockNavigate).toHaveBeenCalledWith('/admin/business');
  });
});
