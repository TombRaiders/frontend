import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import ProfileDropdown from './ProfileDropdown';
import { clearAuth } from '../../utils/authUtils';

vi.mock('../../hooks/useCurrentUserProfile', () => ({
  useCurrentUserProfile: () => ({
    profileImageUrl: 'https://cdn.example.com/profile.png',
  }),
}));

vi.mock('../../utils/authUtils', () => ({
  clearAuth: vi.fn(),
}));

const mockVw = (size) => `${size}px`;

describe('ProfileDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the current profile image and opens the menu', () => {
    render(
      <ProfileDropdown
        vw={mockVw}
        isMenuOpen={false}
        setIsMenuOpen={vi.fn()}
        onProfileClick={vi.fn()}
        onEditClick={vi.fn()}
      />,
    );

    const button = screen.getByRole('button', { name: '프로필 메뉴 토글' });
    expect(button.querySelector('img')).toHaveAttribute(
      'src',
      'https://cdn.example.com/profile.png',
    );
  });

  it('runs the selected menu action and closes the menu', () => {
    const setIsMenuOpen = vi.fn();
    const onProfileClick = vi.fn();
    const onEditClick = vi.fn();

    render(
      <ProfileDropdown
        vw={mockVw}
        isMenuOpen
        setIsMenuOpen={setIsMenuOpen}
        onProfileClick={onProfileClick}
        onEditClick={onEditClick}
      />,
    );

    fireEvent.click(screen.getByRole('menuitem', { name: '개인 페이지' }));
    fireEvent.click(screen.getByRole('menuitem', { name: '정보 관리' }));

    expect(setIsMenuOpen).toHaveBeenCalledWith(false);
    expect(onProfileClick).toHaveBeenCalledTimes(1);
    expect(onEditClick).toHaveBeenCalledTimes(1);
  });

  it('clears auth and shows a logout completion modal', async () => {
    render(
      <ProfileDropdown
        vw={mockVw}
        isMenuOpen
        setIsMenuOpen={vi.fn()}
        onProfileClick={vi.fn()}
        onEditClick={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('menuitem', { name: '로그아웃' }));

    expect(clearAuth).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('정상적으로 로그아웃 되었습니다.')).toBeInTheDocument();
  });
});
