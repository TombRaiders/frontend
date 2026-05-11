import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import ProfileSection from './ProfileSection';

vi.mock('../../utils/style', () => ({
  vw: (size) => `${size}px`,
}));

describe('ProfileSection 컴포넌트 테스트', () => {
  afterEach(() => {
    cleanup();
  });

  it('사용자 닉네임과 소개 정보가 전달된 Props대로 화면에 표시되어야 합니다', () => {
    const mockUser = {
      nickname: '아무개',
      bio: '한라대 컴공 1짱',
    };
    const mockOnEditClick = vi.fn();

    render(<ProfileSection user={mockUser} onEditClick={mockOnEditClick} />);

    expect(screen.getByText('아무개')).toBeInTheDocument();
    expect(screen.getByText('한라대 컴공 1짱')).toBeInTheDocument();
    expect(screen.getByText('편집')).toBeInTheDocument();
  });

  it('사용자 정보(user Prop)가 제공되지 않을 경우 기본 안내 문구가 표시되어야 합니다', () => {
    render(<ProfileSection onEditClick={vi.fn()} />);

    expect(screen.getByText('사용자')).toBeInTheDocument();
    // 💡 해결: 정규표현식을 사용하여 "등록된" 문구가 포함되어도 통과하도록 수정
    expect(screen.getByText(/소개글이 없습니다/)).toBeInTheDocument();
  });

  it('프로필 이미지를 불러오지 못하면 기본 프로필 이미지로 대체되어야 합니다', () => {
    render(
      <ProfileSection
        user={{ nickname: '아무개', profileImageUrl: 'https://cdn.example.com/missing.png' }}
        onEditClick={vi.fn()}
      />,
    );

    const profileImage = screen.getByAltText('아무개의 프로필');
    fireEvent.error(profileImage);

    expect(profileImage).toHaveAttribute('src', '/defaultprofile.png');
  });
});
