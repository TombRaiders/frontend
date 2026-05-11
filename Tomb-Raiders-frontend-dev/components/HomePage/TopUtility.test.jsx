import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TopUtility from './TopUtility';
import * as authUtils from '../../utils/authUtils';

// 💡 인증 상태에 따라 다르게 렌더링되므로 authUtils를 모킹합니다.
vi.mock('../../utils/authUtils', () => ({
  getToken: vi.fn(),
  getUserRole: vi.fn(),
  clearAuth: vi.fn(),
}));

describe('TopUtility 컴포넌트 테스트', () => {
  const mockVw = (px) => `${px}px`;
  const mockGoToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('비로그인 상태일 때 통합된 로그인/회원가입 버튼이 나타나야 합니다', () => {
    // 비로그인 상태 시뮬레이션
    authUtils.getToken.mockReturnValue(null);

    render(
      <TopUtility
        vw={mockVw}
        goToLogin={mockGoToLogin}
        goToMember={vi.fn()}
        goToAdmin={vi.fn()}
        goToPartner={vi.fn()}
      />,
    );

    // 💡 '로그인' 대신 통합된 '로그인/회원가입' 버튼이 있는지 확인
    const loginBtn = screen.getByRole('button', { name: '로그인/회원가입' });
    expect(loginBtn).toBeInTheDocument();

    // 클릭 시 goToLogin 이벤트가 정상 작동하는지 확인
    fireEvent.click(loginBtn);
    expect(mockGoToLogin).toHaveBeenCalledTimes(1);
  });

  it('로그인 상태(USER)일 때 마이페이지와 로그아웃 버튼이 나타나야 합니다', () => {
    // 일반 유저 로그인 상태 시뮬레이션
    authUtils.getToken.mockReturnValue('fake-token');
    authUtils.getUserRole.mockReturnValue('USER');

    render(
      <TopUtility
        vw={mockVw}
        goToLogin={mockGoToLogin}
        goToMember={vi.fn()}
        goToAdmin={vi.fn()}
        goToPartner={vi.fn()}
      />,
    );

    // 💡 로그인 시 표시되어야 할 버튼들 확인
    expect(screen.getByRole('button', { name: '마이페이지' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument();

    // 💡 일반 유저이므로 어드민, 파트너 버튼은 보이지 않아야 함
    expect(screen.queryByRole('button', { name: '어드민' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '파트너' })).not.toBeInTheDocument();
  });

  it('관리자(ADMIN)로 로그인한 경우 어드민 및 파트너 버튼이 나타나야 합니다', () => {
    // 관리자 로그인 상태 시뮬레이션
    authUtils.getToken.mockReturnValue('fake-token');
    authUtils.getUserRole.mockReturnValue('ADMIN');

    render(
      <TopUtility
        vw={mockVw}
        goToLogin={mockGoToLogin}
        goToMember={vi.fn()}
        goToAdmin={vi.fn()}
        goToPartner={vi.fn()}
      />,
    );

    // 💡 관리자용 버튼들 확인
    expect(screen.getByRole('button', { name: '어드민' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '파트너' })).toBeInTheDocument();
  });
});
