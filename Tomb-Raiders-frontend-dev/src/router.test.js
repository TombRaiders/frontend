/** @vitest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRouterFunctions } from './router';

/**
 * useRouterFunctions 커스텀 훅 유닛 테스트
 * 앱 전체에서 공통으로 사용하는 내비게이션 함수들(goToSignup, goToLogin 등)이
 * react-router-dom의 useNavigate를 통해 올바른 경로로 이동을 요청하는지 검증함
 */

// 1. react-router-dom의 useNavigate를 스파이 함수로 모킹함
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('useRouterFunctions 내비게이션 로직 테스트', () => {
  // 각 테스트 전 모킹 기록을 초기화하여 이전 테스트의 영향을 제거함
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('goToSignup 함수 호출 시 "/signup" 경로로 이동을 시도해야 합니다', () => {
    const { result } = renderHook(() => useRouterFunctions());

    result.current.goToSignup();

    // 내비게이션 함수가 올바른 인자와 함께 호출되었는지 확인
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  it('goToLogin 함수 호출 시 "/login" 경로로 이동을 시도해야 합니다', () => {
    const { result } = renderHook(() => useRouterFunctions());

    result.current.goToLogin();

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('goToCommission 함수 호출 시 "/commissions/new" 경로로 이동을 시도해야 합니다', () => {
    const { result } = renderHook(() => useRouterFunctions());

    result.current.goToCommission();

    expect(mockNavigate).toHaveBeenCalledWith('/commissions/new');
  });

  it('goToCommissionCheck 함수 호출 시 "/commissions" 경로로 이동을 시도해야 합니다', () => {
    const { result } = renderHook(() => useRouterFunctions());

    result.current.goToCommissionCheck();

    expect(mockNavigate).toHaveBeenCalledWith('/commissions');
  });
});
