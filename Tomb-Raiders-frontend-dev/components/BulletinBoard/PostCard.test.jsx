/** @vitest-environment jsdom */
import { describe, test, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import PostCard from './PostCard';

afterEach(cleanup);

describe('PostCard', () => {
  test('카드 클릭 시 onClick 함수가 호출된다', () => {
    const mockClick = vi.fn();

    // 💡 1. PostCard가 렌더링될 때 먹고살(?) 가짜(Dummy) 데이터를 만들어줍니다.
    const dummyPost = {
      boardId: 1,
      loginId: 'tester',
      title: '테스트 게시글입니다',
      content: '테스트 내용',
      createdAt: '2026-03-11T10:00:00',
      recommendCount: 5,
      commentCount: 2,
    };

    // 💡 2. 가짜 데이터(post)를 Props로 꼭 챙겨서 넘겨줍니다!
    render(<PostCard post={dummyPost} onClick={mockClick} />);

    // 💡 3. 화면에 그려진 카드를 찾아 클릭합니다.
    // 주의: 만약 PostCard 최상단이 <button> 태그가 아니라 <div> 태그라면
    // getByRole('button')에서 에러가 날 수 있습니다.
    // 가장 안전하고 확실하게 방금 우리가 넣은 '테스트 게시글입니다' 글자를 찾아 클릭하게 만듭니다!
    const cardElement = screen.getByText('테스트 게시글입니다');
    fireEvent.click(cardElement);

    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});
