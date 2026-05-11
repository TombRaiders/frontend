import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CommentItem from './CommentItem';

vi.mock('../../utils/style', () => ({ vw: (val) => `${val}px` }));

describe('CommentItem', () => {
  const mockProps = {
    comment: {
      commentId: 1,
      content: '안녕 테스트',
      authorNickname: '테스터',
      createdAt: '2024-01-01T00:00:00Z',
      children: [],
    },
    isAdmin: false,
    isLoggedIn: true,
    formatDate: (d) => d,
    commentStates: { editingId: null, replyingId: null, activeMenuId: null },
    commentActions: { setEditingId: vi.fn(), setReplyingId: vi.fn(), setActiveMenuId: vi.fn() },
    apiActions: { onDelete: vi.fn(), onReport: vi.fn(), onEditSubmit: vi.fn() },
  };

  it('댓글 내용을 정상적으로 렌더링한다', () => {
    render(<CommentItem {...mockProps} />);
    expect(screen.getByText('안녕 테스트')).toBeDefined();
    expect(screen.getByText('테스터')).toBeDefined();
  });

  it('삭제된 댓글인 경우 안내 문구를 표시한다', () => {
    const deletedProps = { ...mockProps, comment: { ...mockProps.comment, isDeletedDummy: true } };
    render(<CommentItem {...deletedProps} />);
    expect(screen.getByText('삭제된 댓글입니다.')).toBeDefined();
  });

  it('메뉴 버튼(⋮) 클릭 시 액션이 발생한다', () => {
    render(<CommentItem {...mockProps} />);
    fireEvent.click(screen.getByText('⋮'));
    expect(mockProps.commentActions.setActiveMenuId).toHaveBeenCalled();
  });
});
