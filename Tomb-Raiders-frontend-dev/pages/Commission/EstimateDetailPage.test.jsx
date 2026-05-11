import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import EstimateDetailPage from './EstimateDetailPage';
import { orderapi } from '../../api/orderapi';
import { commissionapi } from '../../api/commissionapi';
import { getCookie, setCookie } from '../../utils/authUtils';

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
    getOrderDetail: vi.fn(),
    getOrders: vi.fn(),
    getAssets: vi.fn(),
    getAssetDetail: vi.fn(),
    cancelOrder: vi.fn(),
  },
}));

vi.mock('../../api/commissionapi', () => ({
  commissionapi: {
    getCommissionDetail: vi.fn(),
  },
}));

vi.mock('../../utils/authUtils', () => ({
  getCookie: vi.fn(),
  setCookie: vi.fn(),
}));

vi.mock('../../components/Commission/CommissionHeader', () => ({
  default: () => <div>header</div>,
}));

vi.mock('../../components/Commission/EstimateDetailCard', () => ({
  default: ({ selectedEst, commissionId }) => (
    <div>
      <div>{selectedEst?.title}</div>
      <div>{commissionId}</div>
    </div>
  ),
}));

vi.mock('../../components/Commission/EstimateListTable', () => ({
  default: ({ estimates, onSelect }) => (
    <div>
      {estimates.map((estimate) => (
        <button key={estimate.id} onClick={() => onSelect(estimate.id)}>
          {estimate.title}
        </button>
      ))}
    </div>
  ),
}));

describe('EstimateDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
    vi.spyOn(globalThis, 'confirm').mockImplementation(() => true);
    vi.stubGlobal('innerWidth', 1920);
    vi.mocked(getCookie).mockReturnValue([]);
    vi.mocked(commissionapi.getCommissionDetail).mockResolvedValue(null);
    vi.mocked(orderapi.getAssets).mockResolvedValue({
      isSuccess: true,
      data: {
        content: [],
        page: { number: 0, totalPages: 1 },
      },
    });
  });

  it('restores the order detail from the server and navigates to payment with the selected quotation', async () => {
    vi.mocked(orderapi.getOrderDetail).mockResolvedValue({
      data: {
        orderId: 555,
        commissionId: 88,
        title: 'Restored order',
        img: 'order.png',
        quantity: 2,
        quotations: [
          {
            quotationId: 901,
            partnerName: 'Maker',
            price: 12000,
            quantity: 2,
          },
        ],
      },
    });

    render(
      <MemoryRouter initialEntries={['/estimate-detail/555']}>
        <Routes>
          <Route path="/estimate-detail/:orderId" element={<EstimateDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect((await screen.findAllByText('Restored order')).length).toBeGreaterThan(0);

    fireEvent.click(await screen.findByText('선택한 견적서 결제'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/payment', {
        state: {
          order: expect.objectContaining({
            orderId: 555,
            commissionId: 88,
          }),
          item: expect.objectContaining({
            id: 88,
            title: 'Restored order',
          }),
          estimateData: expect.objectContaining({
            quotationId: 901,
            price: 12000,
            commissionId: 88,
          }),
        },
      });
    });
  });

  it('hydrates quotations from the order list when the commission list only passed summary state', async () => {
    vi.mocked(orderapi.getOrders).mockResolvedValue({
      data: [
        {
          orderId: 777,
          commissionId: 33,
          title: 'Hydrated order',
          img: 'hydrated.png',
          quantity: 1,
          quotationList: [
            {
              quotationId: 991,
              title: 'Hydrated quotation',
              partnerName: 'Partner A',
              price: 34000,
              quantity: 1,
            },
          ],
        },
      ],
    });

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/estimate-detail',
            state: {
              commissionId: 33,
              order: {
                commissionId: 33,
                title: 'Summary only',
                img: 'summary.png',
                quantity: 1,
                quotations: [],
              },
            },
          },
        ]}
      >
        <Routes>
          <Route path="/estimate-detail" element={<EstimateDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Hydrated quotation')).toBeInTheDocument();
    expect(orderapi.getOrders).toHaveBeenCalled();
  });

  it('restores quotations from a commissionId query parameter when navigation state is missing', async () => {
    vi.mocked(orderapi.getOrders).mockResolvedValue({
      data: {
        content: [
          {
            orderId: 778,
            requirements: '의뢰 #34',
            img: 'query.png',
            quantity: 1,
            quotations: [
              {
                quotationId: 992,
                partnerId: 7,
                price: 45000,
                quantity: 1,
              },
            ],
          },
        ],
      },
    });

    render(
      <MemoryRouter initialEntries={['/estimate-detail?commissionId=34']}>
        <Routes>
          <Route path="/estimate-detail" element={<EstimateDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect((await screen.findAllByText('의뢰 #34')).length).toBeGreaterThan(0);
    expect(orderapi.getOrders).toHaveBeenCalled();
  });

  it('uses assetImagePath as the request image instead of the commission representative image', async () => {
    const assetImagePath = 'https://cdn.example.com/assets/commission-3-asset.png';
    vi.mocked(commissionapi.getCommissionDetail).mockResolvedValue({
      data: {
        commissionId: 3,
        title: 'Asset-backed order',
        aiImageUrl: 'https://cdn.example.com/commission/representative.png',
        inputImageUrl: 'https://cdn.example.com/commission/input.png',
        assetImagePath,
        quantity: 1,
      },
    });
    vi.mocked(orderapi.getOrders).mockResolvedValue({ data: [] });

    render(
      <MemoryRouter initialEntries={['/estimate-detail?commissionId=3']}>
        <Routes>
          <Route path="/estimate-detail" element={<EstimateDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Asset-backed order')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', assetImagePath);
  });

  it('finds assetImagePath from the asset list when commission detail only has the representative image', async () => {
    const assetImagePath = 'https://cdn.example.com/assets/commission-3-real-asset.png';
    vi.mocked(commissionapi.getCommissionDetail).mockResolvedValue({
      data: {
        commissionId: 3,
        title: 'Asset list backed order',
        aiImageUrl: 'https://cdn.example.com/commission/representative.png',
        inputImageUrl: 'https://cdn.example.com/commission/input.png',
        status: 'ASSET_CREATED',
        quantity: 1,
      },
    });
    vi.mocked(orderapi.getOrders).mockResolvedValue({ data: [] });
    vi.mocked(orderapi.getAssets).mockResolvedValue({
      isSuccess: true,
      data: {
        content: [
          {
            assetId: 300,
            commissionId: 3,
            assetImagePath,
          },
        ],
        page: { number: 0, totalPages: 1 },
      },
    });

    render(
      <MemoryRouter initialEntries={['/estimate-detail?commissionId=3']}>
        <Routes>
          <Route path="/estimate-detail" element={<EstimateDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Asset list backed order')).toBeInTheDocument();
    await waitFor(() => {
      expect(orderapi.getAssets).toHaveBeenCalledWith({
        page: 0,
        size: 20,
        sort: ['createdAt,desc'],
        commission: true,
      });
    });
    await waitFor(() => {
      expect(screen.getByRole('img')).toHaveAttribute('src', assetImagePath);
    });
  });

  it('cancels the restored order and clears the cookie fallback', async () => {
    vi.mocked(orderapi.cancelOrder).mockResolvedValue({});

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/estimate-detail/555',
            state: {
              order: {
                orderId: 555,
                commissionId: 88,
                title: 'Cancelable order',
                quotations: [],
              },
            },
          },
        ]}
      >
        <Routes>
          <Route path="/estimate-detail/:orderId" element={<EstimateDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('의뢰 취소'));

    await waitFor(() => {
      expect(orderapi.cancelOrder).toHaveBeenCalledWith(555);
    });
    expect(setCookie).toHaveBeenCalledWith('myOrders', []);
    expect(mockNavigate).toHaveBeenCalledWith('/orders/manage', { replace: true });
  });

  it('returns to the source page after cancelling from navigation state', async () => {
    vi.mocked(orderapi.cancelOrder).mockResolvedValue({});

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/estimate-detail/555',
            state: {
              returnTo: '/asset',
              order: {
                orderId: 555,
                commissionId: 88,
                title: 'Cancelable order',
                quotations: [],
              },
            },
          },
        ]}
      >
        <Routes>
          <Route path="/estimate-detail/:orderId" element={<EstimateDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: '의뢰 취소' }));

    await waitFor(() => {
      expect(orderapi.cancelOrder).toHaveBeenCalledWith(555);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/asset', { replace: true });
  });

  it('disables cancel and payment actions when the asset is canceled', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/estimate-detail/555',
            state: {
              order: {
                orderId: 555,
                commissionId: 88,
                title: 'Canceled order',
                assetStatus: 'CANCELED',
                quotations: [
                  {
                    quotationId: 901,
                    partnerName: 'Maker',
                    price: 12000,
                    quantity: 1,
                  },
                ],
              },
            },
          },
        ]}
      >
        <Routes>
          <Route path="/estimate-detail/:orderId" element={<EstimateDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const cancelButton = await screen.findByRole('button', { name: '의뢰 취소' });
    const paymentButton = screen.getByRole('button', { name: '선택한 견적서 결제' });

    expect(cancelButton).toBeDisabled();
    expect(paymentButton).toBeDisabled();

    fireEvent.click(cancelButton);
    fireEvent.click(paymentButton);

    expect(orderapi.cancelOrder).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalledWith('/payment', expect.anything());
  });
});
