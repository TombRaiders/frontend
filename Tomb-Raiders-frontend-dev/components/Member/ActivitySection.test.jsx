import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ActivitySection from './ActivitySection';

/**
 * ActivitySection 컴포넌트 유닛 테스트
 * 마이페이지 활동 내역의 탭(게시글/댓글) 전환 기능이 정상적으로 동작하는지 검증함
 */
describe('ActivitySection 컴포넌트 테스트', () => {
  // 테스트용 모의(Mock) Props 및 함수 정의
  const mockProps = {
    activeTab: '게시글',
    setActiveTab: vi.fn(),
    posts: [],
    comments: [],
    isLoading: false,
    onDeletePost: vi.fn(),
    onDeleteComment: vi.fn(),
  };

  it('탭 버튼 클릭 시 상위 컴포넌트의 탭 상태 변경 함수(setActiveTab)가 호출되어야 합니다', () => {
    render(<ActivitySection {...mockProps} />);

    // '댓글' 탭 버튼을 찾아 클릭 이벤트 발생
    const commentTab = screen.getByRole('button', { name: '댓글' });
    fireEvent.click(commentTab);

    // 함수가 '댓글' 인자와 함께 호출되었는지 확인
    expect(mockProps.setActiveTab).toHaveBeenCalledWith('댓글');
  });
});
