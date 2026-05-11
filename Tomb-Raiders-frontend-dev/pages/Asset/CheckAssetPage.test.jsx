import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import CheckAssetPage from './CheckAssetPage';
import { orderapi } from '../../api/orderapi';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../api/orderapi', () => ({
  orderapi: {
    getAssets: vi.fn(),
    getOrderByAsset: vi.fn(),
  },
}));

vi.mock('../../api/commissionapi', async () => {
  const actual = await vi.importActual('../../api/commissionapi');
  return {
    ...actual,
    commissionapi: {
      deleteCommission: vi.fn(),
    },
  };
});

describe('CheckAssetPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderapi.getAssets.mockResolvedValue({
      isSuccess: true,
      data: {
        content: [],
        page: { number: 0, size: 20, totalPages: 1, totalElements: 0 },
      },
    });
    orderapi.getOrderByAsset.mockResolvedValue({
      isSuccess: true,
      data: null,
    });
  });

  it('loads the asset list from the asset API on mount', async () => {
    render(
      <BrowserRouter>
        <CheckAssetPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(orderapi.getAssets).toHaveBeenCalledWith({
        page: 0,
        size: 20,
        sort: ['createdAt,desc'],
        commission: false,
      });
    });
  });

  it('renders assetImageUrl as the list thumbnail instead of the STL assetUrl', async () => {
    const assetImageUrl =
      'https://cdn.example.com/data/assets/member_2/upload/0.png?signature=thumb';
    const assetUrl = 'https://cdn.example.com/data/assets/member_2/upload/0.stl?signature=model';

    orderapi.getAssets.mockResolvedValue({
      isSuccess: true,
      data: {
        content: [
          {
            assetId: 3,
            assetUrl,
            assetImageUrl,
            createdAt: '2026-05-06T20:01:35.207105',
          },
        ],
        page: { number: 0, size: 20, totalPages: 1, totalElements: 1 },
      },
    });

    render(
      <BrowserRouter>
        <CheckAssetPage />
      </BrowserRouter>,
    );

    await screen.findByText('Asset #3');
    const thumbnail = screen
      .getAllByRole('img')
      .find((image) => image.getAttribute('src') === assetImageUrl);

    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).not.toHaveAttribute('src', assetUrl);
  });

  it('renders the assetStatus label from the asset API', async () => {
    orderapi.getAssets.mockResolvedValue({
      isSuccess: true,
      data: {
        content: [
          {
            assetId: 7,
            assetStatus: 'AI_ASSET_RECREATING',
            createdAt: '2026-05-07T12:30:00',
          },
        ],
        page: { number: 0, size: 20, totalPages: 1, totalElements: 1 },
      },
    });

    render(
      <BrowserRouter>
        <CheckAssetPage />
      </BrowserRouter>,
    );

    expect(await screen.findByText('에셋 재생성 중')).toBeInTheDocument();
    expect(screen.queryByText('진행 상태 확인 중')).not.toBeInTheDocument();
  });

  it('fetches the order by assetId before opening the estimate list', async () => {
    orderapi.getAssets.mockResolvedValue({
      isSuccess: true,
      data: {
        content: [
          {
            assetId: 8,
            commissionId: 3,
            assetStatus: 'ORDER_QUOTING',
            title: 'Project Alpha',
            createdAt: '2026-05-07T12:30:00',
          },
        ],
        page: { number: 0, size: 20, totalPages: 1, totalElements: 1 },
      },
    });
    orderapi.getOrderByAsset.mockResolvedValue({
      isSuccess: true,
      data: {
        orderId: 21,
        commissionId: 3,
        assetId: 8,
        title: 'Project Alpha order',
        quantity: 2,
        quotations: [{ quotationId: 101, price: 5000 }],
      },
    });

    render(
      <MemoryRouter initialEntries={['/asset']}>
        <CheckAssetPage />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /Project Alpha/ }));

    await waitFor(() => {
      expect(orderapi.getOrderByAsset).toHaveBeenCalledWith(8);
      expect(mockNavigate).toHaveBeenCalledWith(
        '/orders/estimate-detail/21',
        expect.objectContaining({
          state: expect.objectContaining({
            returnTo: '/asset',
            orderId: 21,
            commissionId: 3,
            order: expect.objectContaining({
              orderId: 21,
              assetId: 8,
              commissionId: 3,
              title: 'Project Alpha order',
              quotations: [{ quotationId: 101, price: 5000 }],
            }),
          }),
        }),
      );
    });
  });

  it('preserves the current asset URL as the return path when opening estimate detail', async () => {
    orderapi.getAssets.mockResolvedValue({
      isSuccess: true,
      data: {
        content: [
          {
            assetId: 8,
            commissionId: 3,
            assetStatus: 'ORDER_QUOTING',
            title: 'Project Alpha',
            createdAt: '2026-05-07T12:30:00',
          },
        ],
        page: { number: 0, size: 20, totalPages: 1, totalElements: 1 },
      },
    });
    orderapi.getOrderByAsset.mockResolvedValue({
      isSuccess: true,
      data: {
        orderId: 21,
        commissionId: 3,
        assetId: 8,
        title: 'Project Alpha order',
        quantity: 2,
        quotations: [{ quotationId: 101, price: 5000 }],
      },
    });

    render(
      <MemoryRouter initialEntries={['/asset?page=2']}>
        <CheckAssetPage />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /Project Alpha/ }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/orders/estimate-detail/21',
        expect.objectContaining({
          state: expect.objectContaining({
            returnTo: '/asset?page=2',
          }),
        }),
      );
    });
  });

  it('opens the payment detail page when asset payment is complete', async () => {
    orderapi.getAssets.mockResolvedValue({
      isSuccess: true,
      data: {
        content: [
          {
            assetId: 8,
            orderId: 1,
            commissionId: 3,
            assetStatus: 'PAYMENT_COMPLETED',
            title: 'Project Paid',
            createdAt: '2026-05-07T12:30:00',
          },
        ],
        page: { number: 0, size: 20, totalPages: 1, totalElements: 1 },
      },
    });

    render(
      <BrowserRouter>
        <CheckAssetPage />
      </BrowserRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /Project Paid/ }));

    await waitFor(() => {
      expect(orderapi.getOrderByAsset).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith(
        '/payments/1',
        expect.objectContaining({
          state: expect.objectContaining({
            orderId: 1,
            commissionId: 3,
            order: expect.objectContaining({
              orderId: 1,
              assetId: 8,
              commissionId: 3,
              title: 'Project Paid',
            }),
          }),
        }),
      );
    });
  });

  it('does not open an asset while it is still being created', async () => {
    orderapi.getAssets.mockResolvedValue({
      isSuccess: true,
      data: {
        content: [
          {
            assetId: 9,
            assetStatus: 'AI_ASSET_CREATING',
            title: 'Project Creating',
            createdAt: '2026-05-07T12:30:00',
          },
        ],
        page: { number: 0, size: 20, totalPages: 1, totalElements: 1 },
      },
    });

    render(
      <BrowserRouter>
        <CheckAssetPage />
      </BrowserRouter>,
    );

    const assetButton = await screen.findByRole('button', { name: /Project Creating/ });
    expect(assetButton).toBeDisabled();

    fireEvent.click(assetButton);

    expect(orderapi.getOrderByAsset).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('opens the order printing flow from the new project card', async () => {
    render(
      <BrowserRouter>
        <CheckAssetPage />
      </BrowserRouter>,
    );

    const newProjectButton = await screen.findByRole('button', { name: /\+/ });
    fireEvent.click(newProjectButton);

    expect(mockNavigate).toHaveBeenCalledWith('/order-printing');
  });

  it('navigates to the commissions list when clicking "Commissions 목록"', async () => {
    render(
      <BrowserRouter>
        <CheckAssetPage />
      </BrowserRouter>,
    );

    const commissionsButton = await screen.findByRole('button', { name: 'Commissions 목록' });
    fireEvent.click(commissionsButton);

    expect(mockNavigate).toHaveBeenCalledWith('/commissions');
  });
});
