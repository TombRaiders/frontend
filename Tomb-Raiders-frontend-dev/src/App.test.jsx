import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PropTypes from 'prop-types'; // 💡 SonarLint 경고 해결을 위한 PropTypes 임포트
import App from './App';
import * as authUtils from './utils/authUtils';

// --- 의존성 모킹(Mocking) ---
vi.mock('./utils/authUtils', () => ({
  getToken: vi.fn(),
  getUserRoleFromToken: vi.fn(),
  getLoginId: vi.fn(),
}));

vi.mock('./api/apiClient', () => ({
  get: vi.fn().mockResolvedValue({ data: { isSuccess: true, data: {} } }),
}));

// 💡 [핵심] 테스트 환경에서는 페이지 이동을 완벽하게 추적하는 MemoryRouter로 교체합니다.
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  // 💡 모킹용 컴포넌트를 분리하여 SonarLint의 Props 검증 규칙을 만족시킵니다.
  function MockBrowserRouter({ children }) {
    return (
      <actual.MemoryRouter initialEntries={[globalThis.location.pathname]}>
        {children}
      </actual.MemoryRouter>
    );
  }

  MockBrowserRouter.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return {
    ...actual,
    BrowserRouter: MockBrowserRouter,
  };
});

// 라우터 내부의 각 페이지들을 가볍게 렌더링하도록 모킹
vi.mock('./pages/Home/HomePage', () => ({ default: () => <div>홈페이지</div> }));
vi.mock('./pages/Login/LoginPage', () => ({ default: () => <div>로그인 화면</div> }));
vi.mock('./pages/Commission/CommissionPage', () => ({ default: () => <div>의뢰 페이지</div> }));
vi.mock('./pages/Admin/AdminPage', () => ({ default: () => <div>관리자 페이지</div> }));

describe('App 컴포넌트 라우팅 테스트 (Protected Routes 포함)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.history.pushState({}, 'Test page', '/');
  });

  it('로그인한 경우(USER 권한) 홈페이지가 정상적으로 렌더링되지만 관리자 페이지는 차단된다', async () => {
    authUtils.getToken.mockReturnValue('valid-token');
    authUtils.getUserRoleFromToken.mockReturnValue('USER');

    globalThis.history.pushState({}, 'Admin page', '/admin');
    render(<App />);

    expect(await screen.findByText('관리자 권한이 필요한 페이지입니다.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    await waitFor(() => {
      expect(screen.getByText('홈페이지')).toBeInTheDocument();
    });
  });

  it('로그인하지 않은 경우 보호된 페이지(/commission)로 접근하면 경고와 함께 로그인 화면으로 리다이렉트 된다', async () => {
    authUtils.getToken.mockReturnValue(null); // 비로그인 상태

    globalThis.history.pushState({}, 'Commission page', '/commission');
    render(<App />);

    expect(await screen.findByText('로그인이 필요한 서비스입니다.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    await waitFor(() => {
      expect(screen.getByText('로그인 화면')).toBeInTheDocument();
    });
  });

  it('ADMIN 권한이 없는 사용자가 관리자 페이지 접근 시 차단된다', async () => {
    authUtils.getToken.mockReturnValue('valid-token');
    authUtils.getUserRoleFromToken.mockReturnValue('USER'); // 일반 유저

    globalThis.history.pushState({}, 'Admin page', '/admin');
    render(<App />);

    const confirmButton = await screen.findByRole('button', { name: '확인' });
    expect(screen.getByText('관리자 권한이 필요한 페이지입니다.')).toBeInTheDocument();

    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText('관리자 페이지')).not.toBeInTheDocument();
    });
  });

  it('ADMIN 권한이 있는 사용자는 관리자 페이지에 접근할 수 있다', async () => {
    authUtils.getToken.mockReturnValue('valid-token');
    authUtils.getUserRoleFromToken.mockReturnValue('ADMIN'); // 어드민 유저

    globalThis.history.pushState({}, 'Admin page', '/admin');
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('관리자 페이지')).toBeInTheDocument();
    });
  });
});
