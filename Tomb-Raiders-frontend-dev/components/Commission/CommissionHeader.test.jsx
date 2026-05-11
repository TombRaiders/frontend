import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import Cookies from 'js-cookie';
import CommissionHeader from './CommissionHeader';
import { get } from '../../api/apiClient';

vi.mock('../../api/apiClient', () => ({
  get: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CommissionHeader component', () => {
  beforeEach(() => {
    Cookies.remove('accessToken');
    get.mockReset();
  });

  it('calls navigate(-1) when the back button is clicked', () => {
    render(
      <MemoryRouter>
        <CommissionHeader title="Commission" />
      </MemoryRouter>,
    );

    const backButton = screen.getByRole('button', { name: /목록으로/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('shows the current user profile image in the profile menu button', async () => {
    Cookies.set('accessToken', 'fake-token');
    get.mockResolvedValueOnce({
      data: {
        isSuccess: true,
        data: {
          profileImageUrl: 'https://cdn.example.com/me.png',
        },
      },
    });

    render(
      <MemoryRouter>
        <CommissionHeader title="Commission" />
      </MemoryRouter>,
    );

    const profileButton = screen.getByRole('button', { name: /프로필/ });

    expect(get).toHaveBeenCalledWith('/v1/member/me');
    await waitFor(() =>
      expect(profileButton.querySelector('img')).toHaveAttribute(
        'src',
        'https://cdn.example.com/me.png',
      ),
    );
    expect(screen.queryByRole('img', { name: 'profile' })).not.toBeInTheDocument();
  });
});
