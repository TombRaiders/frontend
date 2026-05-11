import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HeaderSection from './HeaderSection';
import * as authUtils from '../../utils/authUtils';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../utils/authUtils', () => ({
  getToken: vi.fn(),
  getUserRole: vi.fn(),
  clearAuth: vi.fn(),
}));

describe('HeaderSection 컴포넌트 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    vw: (val) => `${val}px`,
    goToLogin: vi.fn(),
    goToCommission: vi.fn(),
    goToCommissionCheck: vi.fn(),
    goToMember: vi.fn(),
    goToBulletinBoard: vi.fn(),
    goToAdmin: vi.fn(),
    goToPartner: vi.fn(),
    goToGuide: vi.fn(),
  };

  it('로그인 상태에서 커미션 페이지는 /commissions 경로로, 의뢰 페이지는 /asset 경로로 이동해야 합니다', () => {
    authUtils.getToken.mockReturnValue('fake-token');

    render(
      <MemoryRouter>
        <HeaderSection {...defaultProps} />
      </MemoryRouter>,
    );

    // 1. 커미션 페이지 클릭 테스트
    fireEvent.click(screen.getByText('커미션'));
    // 💡 [수정] goToCommission 함수 대신 navigate('/commissions') 호출 검증
    expect(mockNavigate).toHaveBeenCalledWith('/commissions');

    // 2. 출력 의뢰하기 클릭 테스트
    fireEvent.click(screen.getByText('의뢰'));
    expect(mockNavigate).toHaveBeenCalledWith('/asset');
  });
});
