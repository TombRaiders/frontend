import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import WaitingPage from './WaitingPage';

/**
 * WaitingPage 페이지 유닛 테스트
 * 이메일 인증 후 진입하는 승인 대기 화면의 토큰 유효성 검증,
 * 인증 성공/실패 시의 맞춤 안내 문구 노출,
 * 그리고 2초 후 로그인 또는 회원가입 페이지로의 자동 리다이렉션 로직을 검증함
 */

// 라우터 기능 및 URL 파라미터 조회를 위한 모킹
const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
  };
});

describe('WaitingPage 페이지 테스트', () => {
  // 각 테스트 전 모킹 기록 초기화 및 가짜 타이머(Fake Timers) 설정
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  // 각 테스트 종료 후 실제 타이머로 복구
  afterEach(() => {
    vi.useRealTimers();
  });

  it('유효한 토큰이 URL 파라미터로 전달된 경우 인증 완료 메시지를 성공적으로 표시하고 2초 뒤 로그인 페이지로 이동해야 합니다', () => {
    // 성공 시나리오용 특정 토큰 설정
    mockSearchParams = new URLSearchParams({ token: 'valid-token' });
    render(<WaitingPage />);

    // 성공 안내 문구 확인
    expect(screen.getByText(/이메일 인증이 완료되었습니다!/i)).toBeInTheDocument();

    // 2초의 시간을 강제로 흐르게 함 (act로 감싸 상태 변경 반영)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // 지정된 로그인 경로(/login)로의 내비게이션 여부 검증
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('인증 토큰이 누락된 비정상 접근의 경우 에러 메시지를 표시하고 2초 뒤 다시 회원가입 페이지로 이동해야 합니다', () => {
    // 토큰이 없는 빈 파라미터 상황 설정
    mockSearchParams = new URLSearchParams();
    render(<WaitingPage />);

    // 실패 안내 문구 확인
    expect(screen.getByText(/잘못된 접근이거나 인증 토큰이 없습니다/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // 재가입 유도를 위해 회원가입 경로(/signup)로 이동 여부 검증
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });
});
