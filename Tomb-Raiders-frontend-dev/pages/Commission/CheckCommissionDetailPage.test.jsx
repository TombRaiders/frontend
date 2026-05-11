import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, useParams } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import CommissionDetail from './CheckCommissionDetailPage.jsx';
import { commissionapi } from '../../api/commissionapi';
import { orderapi } from '../../api/orderapi';

vi.mock('../../api/commissionapi', () => ({
  commissionapi: {
    getCommissionDetail: vi.fn(),
    recreateCommission: vi.fn().mockResolvedValue({ isSuccess: true }),
    markCommissionGood: vi.fn().mockResolvedValue({ isSuccess: true }),
  },
  isCommissionImageReady: vi.fn(
    (status, aiImageUrl) =>
      ['DONE', 'AI_IMAGE_DONE', 'ASSET_CREATED', 'ORDER_QUOTED'].includes(status) &&
      Boolean(aiImageUrl ?? true),
  ),
  isCommissionInProgress: vi.fn((status) =>
    ['QUEUED', 'PENDING', 'AI_IMAGE_PROCESSING'].includes(status),
  ),
  isCommissionEstimateStage: vi.fn((status) =>
    ['DONE', 'ASSET_CREATED', 'ORDER_QUOTING', 'ORDER_QUOTED', 'PAYMENT_QUEUED'].includes(status),
  ),
  resolveCommissionTemplateId: vi.fn(() => 1),
}));

vi.mock('../../api/orderapi', () => ({
  orderapi: {
    createAssetFromCommission: vi
      .fn()
      .mockResolvedValue({ isSuccess: true, data: { assetId: 999 } }),
  },
}));

vi.mock('../../utils/imageUtils', () => ({
  convertToSafeImage: vi.fn((img) => img || 'safe-image-url'),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: () => mockNavigate,
  };
});

describe('CheckCommissionDetailPage', () => {
  const mockId = '123';

  beforeEach(() => {
    vi.mocked(useParams).mockReturnValue({ commissionId: mockId });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows a loading state while the detail request is pending', () => {
    vi.mocked(commissionapi.getCommissionDetail).mockReturnValue(new Promise(() => {}));

    render(<CommissionDetail />, { wrapper: MemoryRouter });

    expect(screen.getByText('데이터를 불러오는 중입니다...')).toBeInTheDocument();
  });

  it('shows a not-found state when the commission does not exist', async () => {
    vi.mocked(commissionapi.getCommissionDetail).mockResolvedValue({
      data: null,
    });

    render(<CommissionDetail />, { wrapper: MemoryRouter });

    expect(await screen.findByText('해당 의뢰를 찾을 수 없습니다.')).toBeInTheDocument();
  });

  it('disables detail actions while AI generation is still in progress', async () => {
    vi.mocked(commissionapi.getCommissionDetail).mockResolvedValue({
      data: {
        commissionId: 123,
        inputImageUrl: 'input.jpg',
        aiImageUrl: null,
        status: 'AI_IMAGE_PROCESSING',
      },
    });

    render(<CommissionDetail />, { wrapper: MemoryRouter });

    expect(await screen.findByText('AI 이미지를 생성하는 중입니다...')).toBeInTheDocument();
    const recreateButton = screen.getByRole('button', { name: '이미지 재생성하기' });
    const completeButton = screen.getByRole('button', { name: '생성 완료하기' });

    expect(recreateButton).toBeDisabled();
    expect(completeButton).toBeDisabled();

    fireEvent.click(recreateButton);
    fireEvent.click(completeButton);

    expect(commissionapi.recreateCommission).not.toHaveBeenCalled();
    expect(orderapi.createAssetFromCommission).not.toHaveBeenCalled();
  });

  it('shows the result image and result CTA when AI generation is complete', async () => {
    vi.mocked(commissionapi.getCommissionDetail).mockResolvedValue({
      data: {
        commissionId: 123,
        inputImageUrl: 'input.jpg',
        aiImageUrl: 'result.jpg',
        status: 'AI_IMAGE_DONE',
      },
    });

    render(<CommissionDetail />, { wrapper: MemoryRouter });

    await waitFor(() => {
      const aiImage = screen.getByAltText('AI Result');
      expect(aiImage).toBeInTheDocument();
      expect(aiImage).toHaveAttribute('src', 'result.jpg');
    });

    expect(screen.getByRole('button', { name: '생성 완료하기' })).toBeInTheDocument();
  });

  it('navigates back when the back button is clicked', async () => {
    vi.mocked(commissionapi.getCommissionDetail).mockResolvedValue({
      data: { commissionId: 123, inputImageUrl: 'input.jpg', status: 'PENDING' },
    });

    render(<CommissionDetail />, { wrapper: MemoryRouter });

    fireEvent.click(await screen.findByRole('button', { name: /목록으로/i }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('re-fetches the detail when the recreate button is clicked', async () => {
    vi.mocked(commissionapi.getCommissionDetail).mockResolvedValue({
      data: {
        commissionId: 123,
        inputImageUrl: 'input.jpg',
        aiImageUrl: 'result.jpg',
        status: 'AI_IMAGE_DONE',
        style: '지브리',
      },
    });

    render(<CommissionDetail />, { wrapper: MemoryRouter });

    fireEvent.click(await screen.findByRole('button', { name: '이미지 재생성하기' }));

    await waitFor(() => {
      expect(commissionapi.getCommissionDetail).toHaveBeenCalledTimes(2);
    });
    expect(commissionapi.getCommissionDetail).toHaveBeenLastCalledWith(mockId);
  });

  it('returns to the commission list after asset creation starts', async () => {
    vi.mocked(commissionapi.getCommissionDetail).mockResolvedValue({
      data: {
        commissionId: 123,
        inputImageUrl: 'input.jpg',
        aiImageUrl: 'result.jpg',
        status: 'AI_IMAGE_DONE',
        style: 'Ghibli',
      },
    });

    render(<CommissionDetail />, { wrapper: MemoryRouter });

    fireEvent.click(await screen.findByRole('button', { name: '생성 완료하기' }));

    await waitFor(() => {
      expect(orderapi.createAssetFromCommission).toHaveBeenCalled();
    });

    const confirmBtn = await screen.findByRole('button', { name: '확인' });
    fireEvent.click(confirmBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/commissions');
  });

  it('returns to the commission list even when the commission already has an order id', async () => {
    vi.mocked(commissionapi.getCommissionDetail).mockResolvedValue({
      data: {
        commissionId: 123,
        orderId: 777,
        inputImageUrl: 'input.jpg',
        aiImageUrl: 'result.jpg',
        quotations: [],
        status: 'ORDER_QUOTED',
        style: 'Ghibli',
      },
    });

    render(<CommissionDetail />, { wrapper: MemoryRouter });

    fireEvent.click(await screen.findByRole('button', { name: '생성 완료하기' }));

    await waitFor(() => {
      expect(orderapi.createAssetFromCommission).toHaveBeenCalled();
    });

    const confirmBtn = await screen.findByRole('button', { name: '확인' });
    fireEvent.click(confirmBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/commissions');
  });

  it('navigates to the commission list page when asset creation fails', async () => {
    vi.mocked(commissionapi.getCommissionDetail).mockResolvedValue({
      data: {
        commissionId: 123,
        inputImageUrl: 'input.jpg',
        aiImageUrl: 'result.jpg',
        status: 'AI_IMAGE_DONE',
        style: 'Ghibli',
      },
    });
    vi.mocked(orderapi.createAssetFromCommission).mockRejectedValue(new Error('Creation failed'));

    render(<CommissionDetail />, { wrapper: MemoryRouter });

    fireEvent.click(await screen.findByRole('button', { name: '생성 완료하기' }));

    await waitFor(() => {
      expect(orderapi.createAssetFromCommission).toHaveBeenCalled();
    });

    const confirmBtn = await screen.findByRole('button', { name: '확인' });
    fireEvent.click(confirmBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/commissions');
  });
});
