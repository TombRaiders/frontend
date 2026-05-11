import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import ImageResultPage from './ImageResultPage';
import { commissionapi, isCommissionImageReady } from '../../api/commissionapi';
import { orderapi } from '../../api/orderapi';
import { addressService } from '../../api/addressService';
import { getCookie, setCookie } from '../../utils/authUtils';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../api/commissionapi', () => ({
  commissionapi: {
    getCommissionDetail: vi.fn(),
    recreateCommission: vi.fn(),
  },
  isCommissionImageReady: vi.fn(() => true),
  resolveCommissionTemplateId: vi.fn(() => 1),
}));

vi.mock('../../api/orderapi', () => ({
  orderapi: {
    createAssetFromCommission: vi.fn(),
    createOrder: vi.fn(),
    getAssets: vi.fn(),
    getAssetDetail: vi.fn(),
    getOrderDetail: vi.fn(),
    getOrders: vi.fn(),
  },
}));

vi.mock('../../api/addressService', () => ({
  addressService: {
    getAddresses: vi.fn(),
  },
}));

vi.mock('../../utils/authUtils', () => ({
  getCookie: vi.fn(),
  setCookie: vi.fn(),
}));

vi.mock('../../components/Commission/CommissionHeader', () => ({
  default: () => <div>header</div>,
}));

vi.mock('../../components/Member/MemberShippingMg/ShippingAddressOverlay', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

const renderResultPage = (stateItem) =>
  render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/result',
          state: {
            item: stateItem,
          },
        },
      ]}
    >
      <Routes>
        <Route path="/result" element={<ImageResultPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('ImageResultPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
    vi.stubGlobal('innerWidth', 1920);
    vi.mocked(getCookie).mockReturnValue([]);
    vi.mocked(isCommissionImageReady).mockImplementation(
      (status, aiImageUrl) =>
        ['DONE', 'AI_IMAGE_DONE', 'ASSET_CREATED'].includes(status) && Boolean(aiImageUrl),
    );
    vi.mocked(orderapi.getAssets).mockResolvedValue({
      isSuccess: true,
      data: {
        content: [],
        page: {
          number: 0,
          totalPages: 1,
        },
      },
    });
  });

  it('restores commission detail from the server when only the route param is present', async () => {
    vi.mocked(commissionapi.getCommissionDetail).mockResolvedValue({
      data: {
        commissionId: 321,
        inputImageUrl: 'original.png',
        aiImageUrl: 'generated.png',
        status: 'DONE',
        style: 'Ghibli',
        title: 'Commission 321',
      },
    });

    render(
      <MemoryRouter initialEntries={['/result/321']}>
        <Routes>
          <Route path="/result/:commissionId" element={<ImageResultPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const img = await screen.findByAltText('AI Generated Result');
    expect(img).toHaveAttribute('src', 'generated.png');
    expect(commissionapi.getCommissionDetail).toHaveBeenCalledWith('321');
  });

  it('shows the original image as a pending generated image while AI generation is in progress', async () => {
    vi.mocked(commissionapi.getCommissionDetail).mockResolvedValue({
      data: {
        commissionId: 35,
        inputImageUrl: 'original-35.png',
        aiImageUrl: null,
        status: 'AI_IMAGE_PROCESSING',
        style: 'Ghibli',
        title: 'Commission 35',
      },
    });

    render(
      <MemoryRouter initialEntries={['/commissions/result/35']}>
        <Routes>
          <Route path="/commissions/result/:commissionId" element={<ImageResultPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const img = await screen.findByAltText('AI Generated Result');
    expect(img).toHaveAttribute('src', 'original-35.png');

    fireEvent.click(screen.getByRole('button', { name: '주문 넣기' }));
    expect(globalThis.alert).toHaveBeenCalledWith(
      'AI 이미지가 생성 완료된 후 주문을 넣을 수 있습니다.',
    );
  });

  it('uses asset_image_path from the route state as the representative image', async () => {
    renderResultPage({
      id: 123,
      img: 'original.png',
      aiImg: 'generated.png',
      asset_image_path: 'https://cdn.example.com/assets/generated-preview.png',
      style: 'Ghibli',
      title: 'My commission',
      status: 'ASSET_CREATED',
    });

    const img = await screen.findByAltText('AI Generated Result');
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/assets/generated-preview.png');
    expect(orderapi.getAssetDetail).not.toHaveBeenCalled();
  });

  it('loads asset detail and uses asset_image_path when only assetId is on the commission detail', async () => {
    vi.mocked(commissionapi.getCommissionDetail).mockResolvedValue({
      data: {
        commissionId: 321,
        assetId: 55,
        inputImageUrl: 'original.png',
        aiImageUrl: 'generated.png',
        status: 'ASSET_CREATED',
        style: 'Ghibli',
        title: 'Commission 321',
      },
    });
    vi.mocked(orderapi.getAssetDetail).mockResolvedValue({
      data: {
        assetId: 55,
        asset_image_path: 'https://cdn.example.com/assets/asset-55.png',
      },
    });

    render(
      <MemoryRouter initialEntries={['/result/321']}>
        <Routes>
          <Route path="/result/:commissionId" element={<ImageResultPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(orderapi.getAssetDetail).toHaveBeenCalledWith(55);
    });

    const img = await screen.findByAltText('AI Generated Result');
    await waitFor(() => {
      expect(img).toHaveAttribute('src', 'https://cdn.example.com/assets/asset-55.png');
    });
  });

  it('finds the generated asset by commissionId when commission detail does not include assetId', async () => {
    vi.mocked(commissionapi.getCommissionDetail).mockResolvedValue({
      data: {
        commissionId: 4,
        inputImageUrl: 'original.png',
        aiImageUrl: 'generated.png',
        status: 'ASSET_CREATED',
        style: 'Ghibli',
        title: 'Commission #4',
      },
    });
    vi.mocked(orderapi.getAssets).mockResolvedValue({
      isSuccess: true,
      data: {
        content: [
          {
            assetId: 104,
            commissionId: 4,
            asset_image_path: 'https://cdn.example.com/assets/commission-4-asset.png',
          },
        ],
        page: {
          number: 0,
          totalPages: 1,
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/result/4']}>
        <Routes>
          <Route path="/result/:commissionId" element={<ImageResultPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(orderapi.getAssets).toHaveBeenCalledWith({
        page: 0,
        size: 20,
        sort: ['createdAt,desc'],
        commission: true,
      });
    });

    const img = await screen.findByAltText('AI Generated Result');
    await waitFor(() => {
      expect(img).toHaveAttribute('src', 'https://cdn.example.com/assets/commission-4-asset.png');
    });
  });

  it('creates an asset and an order with the selected quantity before returning to commissions', async () => {
    vi.mocked(addressService.getAddresses).mockResolvedValue({
      data: [{ addressId: 9, isDefault: true }],
    });
    vi.mocked(orderapi.createAssetFromCommission).mockResolvedValue({
      data: { assetId: 55 },
    });
    vi.mocked(orderapi.createOrder).mockResolvedValue({
      data: { orderId: 77, createdAt: '2026-04-25T00:00:00' },
    });
    vi.mocked(orderapi.getOrderDetail).mockResolvedValue({
      data: { orderId: 77, status: 'ORDER_QUOTING' },
    });

    renderResultPage({
      id: 123,
      img: 'original.png',
      aiImg: 'generated.png',
      style: 'Ghibli',
      title: 'My commission',
      status: 'DONE',
    });

    fireEvent.click(screen.getByRole('button', { name: '주문 넣기' }));

    const countInput = screen.getByRole('spinbutton');
    fireEvent.change(countInput, { target: { value: '3' } });

    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    await waitFor(() => {
      expect(orderapi.createAssetFromCommission).toHaveBeenCalledWith({
        commissionId: 123,
        templateId: 1,
      });
    });

    expect(orderapi.createOrder).toHaveBeenCalledWith({
      assetId: 55,
      addressId: 9,
      manufacturingMethod: 'FDM',
      quantity: 3,
      requirements: 'My commission',
    });
    expect(setCookie).toHaveBeenCalledWith(
      'myOrders',
      expect.arrayContaining([
        expect.objectContaining({
          orderId: 77,
          assetId: 55,
          commissionId: 123,
          quantity: 3,
        }),
      ]),
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/success');
    });
  });

  it('reuses an existing asset when placing an order from an already-created commission', async () => {
    vi.mocked(addressService.getAddresses).mockResolvedValue({
      data: [{ addressId: 9, isDefault: true }],
    });
    vi.mocked(orderapi.createAssetFromCommission).mockResolvedValue({
      data: { assetId: 999 },
    });
    vi.mocked(orderapi.createOrder).mockResolvedValue({
      data: { orderId: 77, createdAt: '2026-04-25T00:00:00' },
    });
    vi.mocked(orderapi.getOrderDetail).mockResolvedValue({
      data: { orderId: 77, status: 'ORDER_QUOTING' },
    });

    renderResultPage({
      id: 123,
      assetId: 55,
      img: 'original.png',
      aiImg: 'generated.png',
      asset_image_path: 'https://cdn.example.com/assets/generated-preview.png',
      style: 'Ghibli',
      title: 'My commission',
      status: 'ASSET_CREATED',
    });

    fireEvent.click(screen.getByRole('button', { name: '주문 넣기' }));
    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    await waitFor(() => {
      expect(orderapi.createOrder).toHaveBeenCalledWith({
        assetId: 55,
        addressId: 9,
        manufacturingMethod: 'FDM',
        quantity: 1,
        requirements: 'My commission',
      });
    });

    expect(orderapi.createAssetFromCommission).not.toHaveBeenCalled();
  });

  it('finds and reuses the existing asset before ordering when only asset_image_path is present', async () => {
    vi.mocked(addressService.getAddresses).mockResolvedValue({
      data: [{ addressId: 9, isDefault: true }],
    });
    vi.mocked(orderapi.getAssets).mockResolvedValue({
      isSuccess: true,
      data: {
        content: [
          {
            assetId: 55,
            commissionId: 123,
            asset_image_path: 'https://cdn.example.com/assets/generated-preview.png',
          },
        ],
        page: {
          number: 0,
          totalPages: 1,
        },
      },
    });
    vi.mocked(orderapi.createAssetFromCommission).mockResolvedValue({
      data: { assetId: 999 },
    });
    vi.mocked(orderapi.createOrder).mockResolvedValue({
      data: { orderId: 77, createdAt: '2026-04-25T00:00:00' },
    });
    vi.mocked(orderapi.getOrderDetail).mockResolvedValue({
      data: { orderId: 77, status: 'ORDER_QUOTING' },
    });

    renderResultPage({
      id: 123,
      img: 'original.png',
      aiImg: 'generated.png',
      asset_image_path: 'https://cdn.example.com/assets/generated-preview.png',
      style: 'Ghibli',
      title: 'My commission',
      status: 'ASSET_CREATED',
    });

    await waitFor(() => {
      expect(orderapi.getAssets).toHaveBeenCalledWith({
        page: 0,
        size: 20,
        sort: ['createdAt,desc'],
        commission: true,
      });
    });

    fireEvent.click(screen.getByRole('button', { name: '주문 넣기' }));
    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    await waitFor(() => {
      expect(orderapi.createOrder).toHaveBeenCalledWith({
        assetId: 55,
        addressId: 9,
        manufacturingMethod: 'FDM',
        quantity: 1,
        requirements: 'My commission',
      });
    });

    expect(orderapi.createAssetFromCommission).not.toHaveBeenCalled();
  });

  it('does not create an order with the commission id when asset creation fails', async () => {
    vi.mocked(addressService.getAddresses).mockResolvedValue({
      data: [{ addressId: 9, isDefault: true }],
    });
    vi.mocked(orderapi.createAssetFromCommission).mockRejectedValue(
      new Error('Duplicate asset request'),
    );

    renderResultPage({
      id: 123,
      img: 'original.png',
      aiImg: 'generated.png',
      style: 'Ghibli',
      title: 'My commission',
      status: 'DONE',
    });

    fireEvent.click(screen.getByRole('button', { name: '주문 넣기' }));
    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    await waitFor(() => {
      expect(orderapi.createAssetFromCommission).toHaveBeenCalledWith({
        commissionId: 123,
        templateId: 1,
      });
    });

    expect(orderapi.createOrder).not.toHaveBeenCalled();
    expect(globalThis.alert).toHaveBeenCalledWith('Duplicate asset request');
  });

  it('returns to the commissions list from the final confirmation card', () => {
    renderResultPage({
      id: 123,
      img: 'original.png',
      aiImg: 'generated.png',
      style: 'Ghibli',
      title: 'My commission',
      status: 'DONE',
    });

    fireEvent.click(screen.getByRole('button', { name: '의뢰 목록으로' }));

    expect(mockNavigate).toHaveBeenCalledWith('/commissions');
  });
});
