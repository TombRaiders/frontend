import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import MemberPage from './MemberPage';
import { get } from '../../api/apiClient';

/**
 * MemberPage 페이지 통합 테스트
 * 마이페이지의 핵심 레이아웃 구성 요소(로고, 상단바, 프로필, 활동 내역, 사이드바)의
 * 정상적인 렌더링과 사용자 닉네임/소개글 표시, 그리고 활동 탭 전환 기능을 검증함
 */

// 1. 하위 컴포넌트 모킹: 페이지 단위의 통합 테스트를 위해 각 섹션을 단순화된 블록으로 대체함
vi.mock('../../components/Member/TopNav', () => ({
  default: () => <div data-testid="top-nav">TopNav</div>,
}));

vi.mock('../../components/Member/ProfileSection', () => ({
  default: ({ user }) => (
    <div data-testid="profile-section">
      <span>{user.nickname}</span>
      <span>{user.bio}</span>
    </div>
  ),
}));

vi.mock('../../components/Member/ActivitySection', () => ({
  default: ({ activeTab, setActiveTab }) => (
    <div data-testid="activity-section">
      <button onClick={() => setActiveTab('댓글')}>댓글 탭 버튼</button>
      {activeTab === '댓글' && <div>댓글 내역이 없습니다</div>}
    </div>
  ),
}));

vi.mock('../../components/Member/SidebarSection', () => ({
  default: () => (
    <div data-testid="sidebar-section">
      <div>조회수</div>
      <div>주문, 예약</div>
    </div>
  ),
}));

vi.mock('../../components/Logo/Logo', () => ({
  default: ({ style }) => (
    <div data-testid="logo" style={style}>
      Logo
    </div>
  ),
}));

// 2. 유틸리티 및 라우터 모킹
vi.mock('../../utils/style', () => ({
  vw: (size) => `${size}px`,
}));

vi.mock('../../api/apiClient', () => ({
  get: vi.fn(() => Promise.resolve({ data: { isSuccess: true, data: [] } })),
  del: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('MemberPage 페이지 테스트', () => {
  // 테스트용 가상 사용자 정보
  const mockUser = {
    nickname: '아무개',
    email: 'test@example.com',
    bio: '반갑습니다.',
  };

  // 각 테스트 종료 후 상태 초기화
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // 렌더링 헬퍼 함수
  const renderMemberPage = () =>
    render(
      <MemoryRouter>
        <MemberPage user={mockUser} />
      </MemoryRouter>,
    );

  it('페이지 로드 시 로고와 사용자의 프로필 정보(닉네임, 소개글)가 올바르게 렌더링되어야 합니다', () => {
    renderMemberPage();

    // 로고 및 닉네임 렌더링 여부 확인
    expect(screen.getByTestId('logo')).toHaveStyle({ top: '-12px' });
    expect(screen.getByText('아무개')).toBeInTheDocument();
    expect(screen.getByText('반갑습니다.')).toBeInTheDocument();
  });

  it('활동 내역 섹션의 탭 버튼을 클릭할 경우 요청한 탭(댓글 등)의 내용으로 변경되어야 합니다', () => {
    renderMemberPage();

    // 댓글 탭 전환 버튼 클릭 시뮬레이션
    const commentTabButton = screen.getByText('댓글 탭 버튼');
    fireEvent.click(commentTabButton);

    // 탭 상태 변경에 따른 결과 문구 확인
    expect(screen.getByText(/내역이 없습니다/)).toBeInTheDocument();
  });

  it('마이페이지 전용 사이드바 섹션의 정보(조회수, 주문 정보 등)가 정상적으로 표시되어야 합니다', () => {
    renderMemberPage();

    // 사이드바 내 주요 텍스트 확인
    expect(screen.getByText('조회수')).toBeInTheDocument();
    expect(screen.getByText('주문, 예약')).toBeInTheDocument();
  });

  it('내 정보 조회 응답의 프로필 이미지 URL을 사용자 상태에 반영해야 합니다', async () => {
    get.mockImplementation((url) => {
      if (url === '/v1/member/me') {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: {
              nickname: '서버유저',
              profileImageUrl: 'https://cdn.example.com/member-profile.png',
            },
          },
        });
      }

      return Promise.resolve({ data: { isSuccess: true, data: [] } });
    });
    const setUser = vi.fn();

    render(
      <MemoryRouter>
        <MemberPage user={mockUser} setUser={setUser} />
      </MemoryRouter>,
    );

    await waitFor(() => expect(get).toHaveBeenCalledWith('/v1/member/me'));

    const updateUser = setUser.mock.calls[0][0];
    expect(updateUser({ nickname: '기존유저', profileImageUrl: '' })).toMatchObject({
      nickname: '서버유저',
      profileImageUrl: 'https://cdn.example.com/member-profile.png',
    });
  });
});
