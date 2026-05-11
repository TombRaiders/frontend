/** @vitest-environment jsdom */
import { describe, test, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import DetailView from './DetailView';

// 💡 1. API 요청 가짜 성공 처리 (DetailView가 기다리지 않도록 바로 데이터 투척!)
vi.mock('../../api/apiClient', () => ({
  get: vi.fn().mockResolvedValue({
    data: {
      isSuccess: true,
      data: {
        boardId: 1,
        title: '테스트 게시글',
        content: '테스트 내용입니다.',
        loginId: 'tester',
        createdAt: '2026-03-11',
        recommendCount: 0,
      },
    },
  }),
  post: vi.fn(),
  del: vi.fn(),
  patch: vi.fn(),
}));

// 혹시 모를 라우터 에러 방지용 모킹
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('DetailView', () => {
  // 💡 2. async 키워드를 붙여서 기다릴 수 있는(비동기) 테스트로 만듭니다.
  test('목록으로 돌아가기 버튼 클릭 시 onBack이 호출된다', async () => {
    const mockBack = vi.fn();

    // boardId는 DetailView가 게시글을 불러오기 위해 필요할 테니 가짜로 1을 줍니다.
    render(<DetailView boardId={1} onBack={mockBack} />);

    // 💡 3. getByText가 아니라 findByText를 사용합니다!
    // findByText는 화면에 글자가 나타날 때까지 (최대 1초간) 똑똑하게 기다려줍니다.
    const backButton = await screen.findByText(/목록으로 돌아가기/);

    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
