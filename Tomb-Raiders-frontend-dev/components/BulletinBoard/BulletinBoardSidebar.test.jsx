/** @vitest-environment jsdom */
import { describe, test, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import CommunitySidebar from './BulletinBoardSidebar';

afterEach(cleanup);

describe('CommunitySidebar', () => {
  const mockWrite = vi.fn();
  const mockBoardTypeSelect = vi.fn();

  test('글쓰기 버튼 클릭 시 onWriteClick이 호출된다', () => {
    render(
      <CommunitySidebar
        onWriteClick={mockWrite}
        selectedBoardType="FREE_BOARD"
        onBoardTypeSelect={mockBoardTypeSelect}
      />,
    );

    fireEvent.click(screen.getByText('글쓰기'));
    expect(mockWrite).toHaveBeenCalled();
  });

  test('게시판 메뉴를 선택하면 게시판 타입을 전달한다', () => {
    render(
      <CommunitySidebar
        onWriteClick={mockWrite}
        selectedBoardType="FREE_BOARD"
        onBoardTypeSelect={mockBoardTypeSelect}
      />,
    );

    expect(screen.getByText('자유게시판')).toBeInTheDocument();
    expect(screen.getByText('자랑게시판')).toBeInTheDocument();
    expect(screen.getByText('공지사항')).toBeInTheDocument();

    fireEvent.click(screen.getByText('공지사항'));
    expect(mockBoardTypeSelect).toHaveBeenCalledWith('ADMIN_BOARD');
  });

  test('저장된 사용자 프로필 이미지와 닉네임을 글쓰기 버튼 위에 표시한다', () => {
    sessionStorage.setItem(
      'currentUserProfile',
      JSON.stringify({
        nickname: '커뮤니티유저',
        profileImageUrl: 'https://cdn.example.com/sidebar-profile.png',
      }),
    );

    render(
      <CommunitySidebar
        onWriteClick={mockWrite}
        selectedBoardType="FREE_BOARD"
        onBoardTypeSelect={mockBoardTypeSelect}
      />,
    );

    expect(screen.getByRole('img', { name: '커뮤니티유저의 프로필' })).toHaveAttribute(
      'src',
      'https://cdn.example.com/sidebar-profile.png',
    );
    expect(screen.getByText('커뮤니티유저')).toBeInTheDocument();
  });
});
