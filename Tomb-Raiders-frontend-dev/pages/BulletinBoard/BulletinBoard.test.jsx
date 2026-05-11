import React from 'react';
import { fireEvent, render, screen, cleanup, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import BulletinBoard from './BulletinBoard';
import { get } from '../../api/apiClient';

vi.mock('../../api/apiClient', () => ({
  get: vi.fn((url) => {
    if (url === '/v1/bulletin-boards/popular') {
      return Promise.resolve({
        data: {
          isSuccess: true,
          data: [{ bulletinBoardId: 1, rank: 1, title: '인기글', author: '작성자' }],
        },
      });
    }

    return Promise.resolve({
      data: {
        isSuccess: true,
        data: {
          content: [],
          page: { number: 0, totalPages: 1, totalElements: 0, first: true, last: true },
        },
      },
    });
  }),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  del: vi.fn(),
}));

describe('BulletinBoard 페이지 테스트', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('게시판의 기본 레이아웃과 상단 헤더가 정상적으로 렌더링된다', () => {
    render(
      <BrowserRouter>
        <BulletinBoard />
      </BrowserRouter>,
    );

    expect(screen.getByLabelText(/홈페이지로 이동/i)).toBeInTheDocument();
  });

  it('인기글 API를 호출하고 인기글 목록을 렌더링한다', async () => {
    render(
      <BrowserRouter>
        <BulletinBoard />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/v1/bulletin-boards/popular');
    });
    expect(await screen.findByText('인기글')).toBeInTheDocument();
    expect(screen.getByText('작성자')).toBeInTheDocument();
  });

  it('인기글을 클릭하면 해당 게시글 상세 URL로 이동한다', async () => {
    render(
      <BrowserRouter>
        <BulletinBoard />
      </BrowserRouter>,
    );

    fireEvent.click(await screen.findByText('인기글'));

    await waitFor(() => {
      expect(window.location.search).toContain('boardId=1');
    });
  });

  it('legacy NOTICE board type in the URL is normalized before loading posts', async () => {
    window.history.pushState({}, '', '/bulletinboard?type=NOTICE');

    render(
      <BrowserRouter>
        <BulletinBoard />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith(
        '/v1/bulletin-boards?type=ADMIN_BOARD&page=0&size=10&sort=createdAt%2Cdesc',
      );
    });
  });

  it('keeps page scrolling inside the content area below the fixed header', () => {
    render(
      <BrowserRouter>
        <BulletinBoard />
      </BrowserRouter>,
    );

    expect(screen.getByTestId('bulletinboard-page')).toHaveStyle({
      height: '100vh',
      overflow: 'hidden',
    });
    expect(screen.getByTestId('bulletinboard-scroll-area')).toHaveStyle({
      marginTop: '3.125vw',
      overflowY: 'auto',
    });
  });
});
