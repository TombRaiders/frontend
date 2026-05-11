import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PostDetail from './PostDetail';

vi.mock('../../utils/style', () => ({ vw: (val) => `${val}px` }));

describe('PostDetail', () => {
  const mockPost = {
    title: '블로그 제목',
    content: '블로그 내용입니다.',
    nickname: '글쓴이',
    recommendCount: 10,
    isRecommended: false,
    assetUrl: null,
  };

  it('제목과 본문을 정상적으로 렌더링한다', () => {
    render(
      <PostDetail
        postData={mockPost}
        isAdmin={false}
        onRecommend={vi.fn()}
        formatDate={(d) => d}
      />,
    );
    expect(screen.getByText('블로그 제목')).toBeDefined();
    expect(screen.getByText('블로그 내용입니다.')).toBeDefined();
  });

  it('좋아요 버튼 클릭 시 onRecommend가 호출된다', () => {
    const onRec = vi.fn();
    render(
      <PostDetail postData={mockPost} onRecommend={onRec} isAdmin={false} formatDate={(d) => d} />,
    );
    fireEvent.click(screen.getByText(/좋아요/));
    expect(onRec).toHaveBeenCalled();
  });
});
