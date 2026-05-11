import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLocation } from 'react-router-dom';
import PartnerSidebar from './PartnerSidebar';

/**
 * PartnerSidebar 컴포넌트 유닛 테스트
 * 로고 및 메뉴 항목들의 정상적인 렌더링, 현재 경로(pathname)에 따른 메뉴 활성화 스타일 적용,
 * 그리고 메뉴 클릭 시의 페이지 이동(URL 변경) 기능을 검증함
 */

// 1. 라우터 관련 훅 모킹: 테스트 목적에 맞게 경로와 이동 함수를 제어함
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: vi.fn(),
}));

// 2. 외부 스타일 유틸리티 및 하위 컴포넌트 모킹
vi.mock('../../utils/style', () => ({
  vw: (val) => `${val}vw`,
}));

vi.mock('../Logo/Logo', () => ({
  default: () => <div data-testid="mock-logo">Logo</div>,
}));

describe('PartnerSidebar 컴포넌트 테스트', () => {
  // 각 테스트 실행 전 모킹된 함수들의 호출 기록을 초기화함
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('사이드바 로고와 주요 메뉴(의뢰 확인, 의뢰 수락 목록)가 화면에 정상적으로 렌더링되어야 합니다', () => {
    // 기본 경로 상태 설정
    useLocation.mockReturnValue({ pathname: '/' });
    render(<PartnerSidebar />);

    expect(screen.getByTestId('mock-logo')).toBeInTheDocument();
    expect(screen.getByText('의뢰 확인')).toBeInTheDocument();
    expect(screen.getByText('의뢰 수락 목록')).toBeInTheDocument();
  });

  it('현재 접속 중인 주소와 일치하는 메뉴에만 활성화 스타일(검정색 및 밑줄)이 적용되어야 합니다', () => {
    // '의뢰 수락 목록' 페이지(/partner/accepted)에 접속한 상황 가정
    useLocation.mockReturnValue({ pathname: '/partner/accepted' });
    render(<PartnerSidebar />);

    const activeMenu = screen.getByText('의뢰 수락 목록');
    const inactiveMenu = screen.getByText('의뢰 확인');

    // 활성 메뉴 스타일 검증
    expect(activeMenu.className).toContain('text-black');
    expect(activeMenu.className).toContain('underline');

    // 비활성 메뉴 스타일 검증
    expect(inactiveMenu.className).not.toContain('text-black');
  });

  it('특정 메뉴를 클릭하면 미리 정의된 해당 경로로 navigate 함수가 호출되어야 합니다', () => {
    useLocation.mockReturnValue({ pathname: '/' });
    render(<PartnerSidebar />);

    // '의뢰 확인' 메뉴 클릭 시뮬레이션
    fireEvent.click(screen.getByText('의뢰 확인'));

    // 정해진 파트너 의뢰 경로(/partner/request)로 이동을 시도했는지 확인
    expect(mockNavigate).toHaveBeenCalledWith('/partner/request');
  });
});
