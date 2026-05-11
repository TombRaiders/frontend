import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SignupPage from './SignupPage';

/**
 * SignupPage 페이지 통합 테스트
 * 회원가입에 필요한 필수 입력 필드(아이디, 이메일, 비밀번호)와
 * 가입 실행 버튼의 렌더링 상태를 확인하고,
 * 기존 계정 소유자를 위한 로그인 페이지 이동 내비게이션 기능을 검증함
 */

// 1. 라우터 유틸리티 함수 모킹: 전역 라우터 파일에 정의된 이동 함수 호출 여부 확인
const mockGoToLogin = vi.fn();
vi.mock('../../router.js', () => ({
  useRouterFunctions: () => ({
    goToLogin: mockGoToLogin,
  }),
}));

// 2. 외부 라이브러리(라우터 훅) 모킹
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// 3. 비즈니스 로직(회원가입 처리) 훅 모킹
const mockSignup = vi.hoisted(() => vi.fn());
vi.mock('./useSignup', () => ({
  useSignup: () => ({
    signup: mockSignup,
    isLoading: false,
    error: null,
  }),
}));

// 4. 하위 공통 컴포넌트 모킹: 페이지 단위 테스트의 가독성과 속도를 위해 단순화함
vi.mock('../../components/Login/SignupInput', () => ({
  default: ({ placeholder, type, name, value, onChange, required }) => (
    <input
      placeholder={placeholder}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
    />
  ),
}));

vi.mock('../../components/Login/SignupButton', () => ({
  default: ({ label }) => <button type="submit">{label}</button>,
}));

vi.mock('../../components/Login/SocialDivider', () => ({
  default: ({ text }) => <div>{text}</div>,
}));

vi.mock('../../components/Common/CustomAlertModal', () => ({
  default: ({ isOpen, onClose, title, description, leftBtnText }) =>
    isOpen ? (
      <div role="dialog">
        <p>{title}</p>
        <p>{description}</p>
        <button type="button" onClick={onClose}>
          {leftBtnText}
        </button>
      </div>
    ) : null,
}));

describe('SignupPage 페이지 테스트', () => {
  // 각 테스트 전 모킹 기록 초기화
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignup.mockReset();
  });

  // 각 테스트 종료 후 DOM 청소
  afterEach(() => {
    cleanup();
  });

  it('회원가입 타이틀과 아이디, 이메일 주소, 비밀번호 입력 필드 및 가입 버튼이 화면에 나타나야 합니다', () => {
    render(<SignupPage />);

    // 페이지 대제목 확인
    expect(screen.getByRole('heading', { name: '회원가입' })).toBeDefined();

    // 입력창 플레이스홀더를 통한 요소 탐색
    expect(screen.getByPlaceholderText(/아이디/)).toBeDefined();
    expect(screen.getByPlaceholderText(/이메일 주소/)).toBeDefined();
    expect(screen.getByPlaceholderText(/비밀번호/)).toBeDefined();

    // 회원가입 실행 버튼 확인
    expect(screen.getByRole('button', { name: '가입하기' })).toBeDefined();
  });

  it('하단의 "이미 계정이 있으신가요?" 링크 버튼 클릭 시 로그인 페이지 이동 함수(goToLogin)가 호출되어야 합니다', () => {
    render(<SignupPage />);

    // 하단 내비게이션 문구가 포함된 버튼 클릭 시뮬레이션
    const loginLinkBtn = screen.getByRole('button', { name: /이미 계정이 있으신가요/i });
    fireEvent.click(loginLinkBtn);

    // 라우터 이동 함수가 의도대로 실행되었는지 검증
    expect(mockGoToLogin).toHaveBeenCalledTimes(1);
  });

  it('회원가입 성공 모달 확인 시 메인 페이지로 이동해야 합니다', async () => {
    mockSignup.mockResolvedValue(true);
    render(<SignupPage />);

    fireEvent.change(screen.getByPlaceholderText(/아이디/), {
      target: { name: 'loginId', value: 'new-user' },
    });
    fireEvent.change(screen.getByPlaceholderText(/이메일 주소/), {
      target: { name: 'email', value: 'new-user@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/비밀번호/), {
      target: { name: 'password', value: 'safe-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: '가입하기' }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
