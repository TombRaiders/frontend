import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import TopNav from './TopNav';
import { get } from '../../api/apiClient';

/**
 * TopNav 컴포넌트 유닛 테스트
 * 상단 네비게이션 바의 기본 요소 렌더링, 프로필 메뉴 토글 동작,
 * 그리고 로그아웃 시 커스텀 모달 알림 및 페이지 이동 로직을 검증함
 */

// 1. 라우팅 기능 모킹
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../router.js', () => ({
  useRouterFunctions: () => ({
    goToMember: vi.fn(),
  }),
}));

// 2. 스타일 모킹 (vw 함수 처리)
vi.mock('../../utils/style', () => ({
  vw: (val) => `${val}vw`,
}));

vi.mock('../../api/apiClient', () => ({
  get: vi.fn(),
}));

/**
 * 테스트용 래퍼 컴포넌트
 * 메뉴 열림 상태(isMenuOpen)를 부모 컴포넌트처럼 관리하기 위해 작성됨
 */
function TestWrapper() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  return <TopNav isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />;
}

const getProfileButton = () => screen.getByRole('button', { name: /프로필 메뉴 토글/i });

describe('TopNav 컴포넌트 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    get.mockReset();

    // JSDOM 환경에서 location.href 변경이 가능하도록 writable 속성으로 재정의
    const originalLocation = globalThis.location;
    delete globalThis.location;
    globalThis.location = Object.create(originalLocation);
    Object.defineProperty(globalThis.location, 'href', {
      value: '',
      writable: true,
      configurable: true,
    });
  });

  it('로그아웃 버튼 클릭 시 성공 모달이 나타나고 확인을 누르면 메인 페이지로 이동해야 합니다', async () => {
    render(
      <MemoryRouter>
        <TestWrapper />
      </MemoryRouter>,
    );

    // 1. 프로필 메뉴를 클릭하여 드롭다운 노출
    const toggleBtn = getProfileButton();
    fireEvent.click(toggleBtn);

    // 2. 로그아웃 버튼 클릭
    const logoutBtn = screen.getByText('로그아웃');
    fireEvent.click(logoutBtn);

    // 💡 3. alert 대신 CustomAlertModal의 텍스트가 화면에 떴는지 확인 (비동기)
    const modalMessage = await screen.findByText('정상적으로 로그아웃 되었습니다.');
    expect(modalMessage).toBeInTheDocument();

    // 💡 4. 모달의 '확인' 버튼을 찾아 클릭 (이 시점에서 location.href가 바뀜)
    const confirmBtn = screen.getByRole('button', { name: '확인' });
    fireEvent.click(confirmBtn);

    // 5. 전역 경로가 홈('/')으로 변경되었는지 확인
    expect(globalThis.location.href).toBe('/');
  });

  it('검색창과 프로필 버튼 등 기본 UI 요소들이 정상적으로 화면에 나타나야 합니다', () => {
    render(
      <MemoryRouter>
        <TestWrapper />
      </MemoryRouter>,
    );

    // 검색 입력창 및 프로필 토글 버튼 존재 여부 확인
    expect(screen.getByPlaceholderText('검색')).toBeInTheDocument();
    expect(getProfileButton()).toBeInTheDocument();
  });

  it('저장된 프로필 이미지가 프로필 메뉴 버튼에 표시되어야 합니다', () => {
    sessionStorage.setItem(
      'currentUserProfile',
      JSON.stringify({ profileImageUrl: 'https://cdn.example.com/member-nav.png' }),
    );

    render(
      <MemoryRouter>
        <TestWrapper />
      </MemoryRouter>,
    );

    expect(getProfileButton().querySelector('img')).toHaveAttribute(
      'src',
      'https://cdn.example.com/member-nav.png',
    );
  });
});
