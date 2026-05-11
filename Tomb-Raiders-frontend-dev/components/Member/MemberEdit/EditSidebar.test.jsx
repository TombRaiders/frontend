import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import EditSidebar from './EditSidebar';

/**
 * EditSidebar 컴포넌트 유닛 테스트
 * 회원 정보 수정 페이지 사이드바의 메뉴 항목(정보 관리, 배송지 관리) 렌더링,
 * 활성화 상태에 따른 스타일 적용, 그리고 메뉴 클릭 이벤트 발성을 검증함
 */

// 스타일 유틸리티(vw) 모킹
vi.mock('../../../utils/style', () => ({
  vw: (size) => `${size}px`,
}));

describe('EditSidebar 컴포넌트 테스트', () => {
  // 각 테스트 종료 후 DOM 상태를 초기화함
  afterEach(() => {
    cleanup();
  });

  const mockVw = (s) => `${s}px`;
  const mockOnMenuClick = vi.fn();

  it('"정보 관리" 메뉴가 활성화되었을 때 강조 스타일(흰색 배경, 굵은 글씨)이 올바르게 적용되어야 합니다', () => {
    render(<EditSidebar vw={mockVw} activeMenu="정보 관리" onMenuClick={mockOnMenuClick} />);

    const infoTab = screen.getByText('정보 관리');
    const addressTab = screen.getByText('배송지 관리');

    // 활성화된 '정보 관리' 탭의 스타일 검증 (배경색 및 폰트 굵기)
    expect(infoTab).toHaveStyle('background-color: rgb(255, 255, 255)');
    expect(infoTab).toHaveStyle('color: rgb(51, 51, 51)');
    expect(infoTab).toHaveStyle('font-weight: bold');

    // 비활성화된 '배송지 관리' 탭의 스타일 검증 (회색 텍스트 및 투명 배경)
    expect(addressTab).toHaveStyle('color: rgb(176, 176, 176)');
    expect(addressTab).toHaveStyle('background-color: rgba(0, 0, 0, 0)');
  });

  it('"배송지 관리" 메뉴가 활성화되었을 때 강조 스타일이 "배송지 관리" 탭에 적용되어야 합니다', () => {
    render(<EditSidebar vw={mockVw} activeMenu="배송지 관리" onMenuClick={mockOnMenuClick} />);

    const infoTab = screen.getByText('정보 관리');
    const addressTab = screen.getByText('배송지 관리');

    // '배송지 관리' 탭의 활성화 스타일 검증
    expect(addressTab).toHaveStyle('background-color: rgb(255, 255, 255)');
    expect(addressTab).toHaveStyle('color: rgb(51, 51, 51)');
    expect(addressTab).toHaveStyle('font-weight: bold');

    // '정보 관리' 탭의 비활성화 상태 확인
    expect(infoTab).toHaveStyle('color: rgb(176, 176, 176)');
  });

  it('비활성 메뉴 클릭 시 상위 컴포넌트의 메뉴 변경 함수(onMenuClick)가 호출되어야 합니다', () => {
    render(<EditSidebar vw={mockVw} activeMenu="정보 관리" onMenuClick={mockOnMenuClick} />);

    // '배송지 관리' 버튼 클릭 시뮬레이션
    const addressTab = screen.getByText('배송지 관리');
    addressTab.click();

    // 클릭된 메뉴 이름과 함께 함수가 호출되었는지 확인
    expect(mockOnMenuClick).toHaveBeenCalledWith('배송지 관리');
  });
});
