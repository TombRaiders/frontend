/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import Cookies from 'js-cookie';
import OrangeHeader from './OrangeHeader';
import { get } from '../../api/apiClient';

vi.mock('../../api/apiClient', () => ({
  get: vi.fn(),
}));

vi.mock('../../router.js', () => ({
  useRouterFunctions: () => ({
    goToMember: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../utils/style', () => ({
  vw: (val) => `${val}vw`,
}));

beforeEach(() => {
  vi.clearAllMocks();
  Cookies.remove('accessToken');
  get.mockReset();
});

afterEach(() => cleanup());

describe('OrangeHeader', () => {
  test('renders the logo link to the home route', () => {
    render(
      <BrowserRouter>
        <OrangeHeader />
      </BrowserRouter>,
    );

    const logoLink = screen.getByRole('link');
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  test('keeps the fixed header out of the browser scrollbar area', () => {
    render(
      <BrowserRouter>
        <OrangeHeader />
      </BrowserRouter>,
    );

    const header = screen.getByRole('banner');
    expect(header).toHaveStyle({
      left: '0px',
      right: 'calc(100vw - 100%)',
      width: 'auto',
    });
  });

  test('opens the dropdown menu when the profile button is clicked', () => {
    Cookies.set('accessToken', 'fake-token');
    get.mockResolvedValueOnce({
      data: {
        isSuccess: true,
        data: {
          profileImageUrl: '',
        },
      },
    });

    render(
      <BrowserRouter>
        <OrangeHeader />
      </BrowserRouter>,
    );

    expect(screen.queryByText('로그아웃')).not.toBeInTheDocument();

    const profileButton = screen.getByRole('button', { name: /프로필/ });
    fireEvent.click(profileButton);

    expect(screen.getByText('로그아웃')).toBeInTheDocument();
    expect(screen.getByText('개인 페이지')).toBeInTheDocument();
  });

  test('shows the current user profile image in the profile menu button', async () => {
    Cookies.set('accessToken', 'fake-token');
    get.mockResolvedValueOnce({
      data: {
        isSuccess: true,
        data: {
          profileImageUrl: 'https://cdn.example.com/community-me.png',
        },
      },
    });

    render(
      <BrowserRouter>
        <OrangeHeader />
      </BrowserRouter>,
    );

    const profileButton = screen.getByRole('button', { name: /프로필/ });

    expect(get).toHaveBeenCalledWith('/v1/member/me');
    await waitFor(() =>
      expect(profileButton.querySelector('img')).toHaveAttribute(
        'src',
        'https://cdn.example.com/community-me.png',
      ),
    );
    expect(screen.queryByRole('img', { name: 'profile' })).not.toBeInTheDocument();
  });
});
