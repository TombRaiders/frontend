import React from 'react';
import { fireEvent, render, screen, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import HomePage from './HomePage';
import { get } from '../../api/apiClient';

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock('../../utils/authUtils', () => ({
  getToken: vi.fn(() => null),
  getUserRole: vi.fn(() => null),
}));

vi.mock('../../api/apiClient', () => ({
  get: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const successResponse = (data) => ({
  data: {
    isSuccess: true,
    data,
  },
});

const createHomePageProps = () => ({
  goToSignup: vi.fn(),
  goToLogin: vi.fn(),
  goToCommission: vi.fn(),
  goToCommissionCheck: vi.fn(),
  goToMember: vi.fn(),
  goToBulletinBoard: vi.fn(),
  goToAdmin: vi.fn(),
  goToPartner: vi.fn(),
});

const mockHomeApiResponses = ({
  notices = [],
  reviews = [],
  communities = [],
  railImages = [],
} = {}) => {
  get.mockReset();
  get
    .mockResolvedValueOnce(successResponse({ content: notices }))
    .mockResolvedValueOnce(successResponse(reviews))
    .mockResolvedValueOnce(successResponse({ content: communities }))
    .mockResolvedValueOnce(successResponse(railImages));
};

const renderHomePage = (props = {}) => {
  return render(
    <MemoryRouter>
      <HomePage {...createHomePageProps()} {...props} />
    </MemoryRouter>,
  );
};

describe('HomePage 페이지 테스트', () => {
  beforeEach(() => {
    globalThis.history.pushState({}, '', '/');

    mockHomeApiResponses({
      notices: [{ boardId: 77, title: '서비스 점검 공지', createdAt: '2026-04-23T00:00:00' }],
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('홈페이지 로드 시 헤더/푸터 로고, 개편된 메뉴, 메인 배너, 검색창이 화면에 정상적으로 렌더링되어야 합니다', async () => {
    renderHomePage();

    await waitFor(() => {
      const logos = screen.getAllByAltText('웹로고');
      expect(logos.length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getByRole('button', { name: '커미션' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '의뢰' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '커뮤니티' })).toBeInTheDocument();

    expect(screen.getByPlaceholderText('게시물 검색')).toBeInTheDocument();

    const myTexts = screen.getAllByText(/나만의/);
    expect(myTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('홈 공지사항을 클릭하면 BulletinBoard 공지사항 상세로 이동합니다', async () => {
    renderHomePage();

    expect(screen.getByRole('heading', { name: '안내사항' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '더보기 >' })).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('서비스 점검 공지')).toBeInTheDocument());

    expect(screen.queryByText('MAKERCTION 2026년 신규 가입 이벤트 안내')).not.toBeInTheDocument();

    expect(get).toHaveBeenCalledWith(
      '/v1/bulletin-boards?type=ADMIN_BOARD&page=0&size=4&sort=createdAt%2Cdesc',
    );
    fireEvent.click(screen.getByRole('button', { name: /서비스 점검 공지/ }));

    expect(mockNavigate).toHaveBeenCalledWith('/bulletinboard?type=ADMIN_BOARD&boardId=77');
  });

  it('공지사항 더 보기를 클릭하면 BulletinBoard 공지사항 목록으로 이동합니다', async () => {
    renderHomePage();

    const moreBtn = await screen.findByRole('button', { name: '더보기 >' });
    fireEvent.click(moreBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/bulletinboard?type=ADMIN_BOARD');
  });

  it('홈 공지사항은 최대 4개까지만 렌더링합니다', async () => {
    mockHomeApiResponses({
      notices: Array.from({ length: 6 }, (_, index) => ({
        boardId: index + 1,
        title: `공지 ${index + 1}`,
        createdAt: '2026-04-23T00:00:00',
      })),
    });

    renderHomePage();

    await waitFor(() => expect(screen.getByText('공지 4')).toBeInTheDocument());
    expect(screen.queryByText('공지 5')).not.toBeInTheDocument();
  });

  it('생생한 후기는 메인 후기 API 결과로 렌더링하고 상세로 이동합니다', async () => {
    mockHomeApiResponses({
      reviews: [
        {
          boardId: 123,
          imageUrl: 'https://cdn.example.com/review.png',
          title: 'API 후기 제목',
          authorNickname: '핀포인트 작성자',
          authorProfileImageUrl: 'https://cdn.example.com/profile.png',
        },
      ],
    });

    renderHomePage();

    await waitFor(() => expect(screen.getByText('API 후기 제목')).toBeInTheDocument());
    expect(screen.getByText('핀포인트 작성자')).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith('/v1/main/bulletin-boards');

    fireEvent.click(screen.getByRole('button', { name: /API 후기 제목/ }));

    expect(mockNavigate).toHaveBeenCalledWith('/bulletinboard?type=BRAGGING_BOARD&boardId=123');
  });

  it('커뮤니티는 자유게시판 최신글을 렌더링하고 상세로 이동합니다', async () => {
    mockHomeApiResponses({
      communities: [
        {
          boardId: 321,
          title: '자유게시판 최신글',
          nickname: '커뮤니티 작성자',
          assetUrl: 'https://cdn.example.com/community.png',
        },
      ],
    });

    renderHomePage();

    await waitFor(() => expect(screen.getByText('자유게시판 최신글')).toBeInTheDocument());
    expect(screen.getByText('커뮤니티 작성자')).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith(
      '/v1/bulletin-boards?type=FREE_BOARD&page=0&size=4&sort=createdAt%2Cdesc',
    );

    fireEvent.click(screen.getByRole('button', { name: /자유게시판 최신글/ }));

    expect(mockNavigate).toHaveBeenCalledWith('/bulletinboard?type=FREE_BOARD&boardId=321');
  });

  it('rail images API 결과를 하단 레일에 렌더링합니다', async () => {
    mockHomeApiResponses({
      railImages: [
        {
          imageId: 42,
          imageUrl: 'iVBORw0KGgoAAA',
          altText: 'Rail Base64',
        },
      ],
    });

    renderHomePage();

    await waitFor(() => {
      const railImages = screen.getAllByAltText('Rail Base64');
      expect(railImages[0]).toHaveAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAA');
    });
    expect(get).toHaveBeenCalledWith('/v1/main/rail-images');
  });
});
