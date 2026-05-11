/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import RightSideBar from './RightSideBar';

const popularPosts = Array.from({ length: 12 }, (_, index) => ({
  bulletinBoardId: index + 1,
  rank: index + 1,
  title: `인기글 ${index + 1}`,
  author: `작성자${index + 1}`,
}));

describe('RightSideBar', () => {
  test('write view에서 작성 버튼이 보이고 read view에서는 숨겨진다', () => {
    const { rerender } = render(<RightSideBar view="write" />);
    expect(screen.getByText('올리기')).toBeInTheDocument();

    rerender(<RightSideBar view="read" />);
    expect(screen.queryByText('올리기')).not.toBeInTheDocument();
  });

  test('인기글을 최대 10개까지 보여준다', () => {
    render(<RightSideBar popularPosts={popularPosts} />);

    expect(screen.getByRole('region', { name: '인기글' })).toBeInTheDocument();
    expect(screen.getByText('인기글 TOP 10')).toBeInTheDocument();
    expect(screen.getByText('인기글 10')).toBeInTheDocument();
    expect(screen.queryByText('인기글 11')).not.toBeInTheDocument();
  });

  test('인기글 클릭 시 선택한 글을 전달한다', () => {
    const handlePopularPostClick = vi.fn();
    render(
      <RightSideBar
        popularPosts={popularPosts.slice(0, 1)}
        onPopularPostClick={handlePopularPostClick}
      />,
    );

    fireEvent.click(screen.getByText('인기글 1'));

    expect(handlePopularPostClick).toHaveBeenCalledWith(popularPosts[0]);
  });
});
