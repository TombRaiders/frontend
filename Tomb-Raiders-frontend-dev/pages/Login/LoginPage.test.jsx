import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import LoginPage from './LoginPage';
import { post } from '../../api/apiClient';
import { setLoginId, setMemberId, setToken, setUserRole } from '../../utils/authUtils.js';

const mockNavigate = vi.fn();
const mockGoToSignup = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../router.js', () => ({
  useRouterFunctions: () => ({
    goToSignup: mockGoToSignup,
  }),
}));

vi.mock('../../api/apiClient', () => ({
  post: vi.fn(),
}));

vi.mock('../../utils/authUtils.js', () => ({
  setToken: vi.fn(),
  setLoginId: vi.fn(),
  setUserRole: vi.fn(),
  setMemberId: vi.fn(),
}));

vi.mock('../../components/Login/LoginCard', () => ({
  default: ({ children, title }) => (
    <section>
      <h1>{title}</h1>
      {children}
    </section>
  ),
}));

vi.mock('../../components/Login/LoginInput', () => ({
  default: ({ type, placeholder, value, onChange, required }) => (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  ),
}));

vi.mock('../../components/Login/LoginButton', () => ({
  default: ({ label, type, disabled }) => (
    <button type={type} disabled={disabled}>
      {label}
    </button>
  ),
}));

vi.mock('../../components/Login/SocialDivider', () => ({
  default: ({ text }) => <div>{text}</div>,
}));

vi.mock('../../components/Common/CustomAlertModal', () => ({
  default: ({ isOpen, title, description }) =>
    isOpen ? (
      <div role="alert">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    ) : null,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('submits the exact user input and accepts a success response', async () => {
    vi.mocked(post).mockResolvedValue({
      data: {
        success: true,
        data: {
          accessToken: 'access-token',
          loginId: 'user@example.com',
          role: 'USER',
          id: 7,
        },
      },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('아이디*'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('비밀번호*'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/v1/auth/signin', {
        loginId: 'user@example.com',
        password: 'password123',
      });
    });

    expect(setToken).toHaveBeenCalledWith('access-token');
    expect(setLoginId).toHaveBeenCalledWith('user@example.com');
    expect(setUserRole).toHaveBeenCalledWith('USER');
    expect(setMemberId).toHaveBeenCalledWith(7);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows the server failure message when signin returns isSuccess false', async () => {
    vi.mocked(post).mockResolvedValue({
      data: {
        isSuccess: false,
        errorDetail: {
          message: '입력값이 올바르지 않습니다',
        },
      },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('아이디*'), {
      target: { value: 'unknown' },
    });
    fireEvent.change(screen.getByPlaceholderText('비밀번호*'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('입력값이 올바르지 않습니다');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows suspended member details when signin is rejected with MEMBER_SUSPENDED', async () => {
    vi.mocked(post).mockRejectedValue({
      response: {
        status: 403,
        data: {
          isSuccess: false,
          errorDetail: {
            code: 'MEMBER_SUSPENDED',
            message: '활동이 정지된 계정입니다. 관리자에게 문의하세요.',
            details: {
              reason: '운영 정책 위반',
              bannedAt: '2026-05-01T12:00:00',
              banExpiredAt: null,
            },
          },
        },
      },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('아이디*'), {
      target: { value: 'suspended-user' },
    });
    fireEvent.change(screen.getByPlaceholderText('비밀번호*'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('활동이 정지된 계정입니다. 관리자에게 문의하세요.');
    expect(alert).toHaveTextContent('정지 사유: 운영 정책 위반');
    expect(alert).toHaveTextContent('정지 시작: 2026-05-01 12:00');
    expect(alert).toHaveTextContent('정지 해제 예정: 영구 정지');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('uses the signup navigation callback', () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: '계정 만들기' }));

    expect(mockGoToSignup).toHaveBeenCalledTimes(1);
  });
});
