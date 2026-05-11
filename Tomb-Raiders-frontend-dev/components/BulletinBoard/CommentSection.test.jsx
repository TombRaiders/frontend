import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CommentSection from './CommentSection';

vi.mock('../../utils/style', () => ({ vw: (val) => `${val}px` }));

describe('CommentSection', () => {
  const mockProps = {
    comments: [],
    postData: { commentCount: 0 },
    isAdmin: false,
    isLoggedIn: true,
    formatDate: vi.fn(),
    newComment: '',
    setNewComment: vi.fn(),
    onCommentSubmit: vi.fn(),
    commentStates: {},
    commentActions: {},
    apiActions: {},
  };

  it('댓글이 없을 때 안내 문구를 보여준다', () => {
    render(<CommentSection {...mockProps} />);
    expect(screen.getByText('첫 번째 댓글을 남겨보세요!')).toBeDefined();
  });

  it('입력창에 타이핑하면 setNewComment가 호출된다', () => {
    render(<CommentSection {...mockProps} />);
    const input = screen.getByPlaceholderText('댓글을 남겨보세요.');
    fireEvent.change(input, { target: { value: '새 댓글' } });
    expect(mockProps.setNewComment).toHaveBeenCalled();
  });

  it('등록 버튼 클릭 시 onSubmit이 호출된다', () => {
    render(<CommentSection {...mockProps} />);
    fireEvent.click(screen.getByText('등록'));
    expect(mockProps.onCommentSubmit).toHaveBeenCalled();
  });
});
