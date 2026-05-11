import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import CheckCommissionPage from './CheckCommissionPage';
import { useCommission } from './useCommission';

// 1. useNavigate 모킹 (페이지 이동 감지용)
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 2. useCommission 훅 모킹 (가짜 데이터 제공)
vi.mock('./useCommission', () => ({
  useCommission: vi.fn(),
}));

// 3. API 모킹
vi.mock('../../api/commissionapi', async () => {
  const actual = await vi.importActual('../../api/commissionapi');
  return {
    ...actual,
    commissionapi: {
      deleteCommission: vi.fn(),
    },
  };
});

describe('CheckCommissionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens the commission creation flow from the dashed new commission card', async () => {
    useCommission.mockReturnValue({
      commissions: [],
      fetchCommissions: vi.fn().mockResolvedValue(),
      loading: false,
      pageInfo: { totalPages: 1, totalElements: 0 },
    });

    render(
      <BrowserRouter>
        <CheckCommissionPage />
      </BrowserRouter>,
    );

    const newCommissionBtn = await screen.findByText('새로운 프로젝트');
    fireEvent.click(newCommissionBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/commissions/new');
  });

  it('renders all commissions regardless of status and opens the estimate detail page', async () => {
    useCommission.mockReturnValue({
      commissions: [
        {
          commissionId: 1,
          orderId: 101,
          status: 'QUOTED', // 견적서 도착 (화면에 보여야 함)
          title: '고양이 의뢰',
        },
        {
          commissionId: 2,
          orderId: 102,
          status: 'PAID', // 결제 완료 (상태 무관하게 목록에 표출되어야 함)
          title: '강아지 의뢰',
        },
      ],
      fetchCommissions: vi.fn().mockResolvedValue(),
      loading: false,
      pageInfo: { totalPages: 1, totalElements: 2 },
    });

    render(
      <MemoryRouter initialEntries={['/commissions']}>
        <CheckCommissionPage />
      </MemoryRouter>,
    );

    // 고양이 의뢰는 화면에 있어야 함
    const catCommission = await screen.findByText('고양이 의뢰');
    expect(catCommission).toBeInTheDocument();

    // 강아지 의뢰(결제완료)도 상태 필터가 해제되어 화면에 있어야 함
    const dogCommission = await screen.findByText('강아지 의뢰');
    expect(dogCommission).toBeInTheDocument();

    // 카드 상세 보기 버튼 클릭 (aria-label 기준)
    const detailButton = screen.getByRole('button', { name: /고양이 의뢰 상세 보기/i });
    fireEvent.click(detailButton);

    expect(mockNavigate).toHaveBeenCalledWith('/orders/estimate-detail/101', {
      state: {
        returnTo: '/commissions',
        commissionId: 1,
        order: expect.objectContaining({
          commissionId: 1,
          orderId: 101,
          status: 'QUOTED',
        }),
      },
    });
  });

  it('opens the order estimate page when a commission is waiting for quotations', async () => {
    useCommission.mockReturnValue({
      commissions: [
        {
          commissionId: 3,
          status: 'ORDER_QUOTING',
          title: 'Quotation waiting commission',
          inputImageUrl: 'input.png',
          style: 'Ghibli',
        },
      ],
      fetchCommissions: vi.fn().mockResolvedValue(),
      loading: false,
      pageInfo: { totalPages: 1, totalElements: 1 },
    });

    render(
      <MemoryRouter initialEntries={['/commissions']}>
        <CheckCommissionPage />
      </MemoryRouter>,
    );

    const detailButton = await screen.findByRole('button', {
      name: /Quotation waiting commission/i,
    });
    fireEvent.click(detailButton);

    expect(mockNavigate).toHaveBeenCalledWith('/orders/estimate-detail?commissionId=3', {
      state: {
        returnTo: '/commissions',
        commissionId: 3,
        order: expect.objectContaining({
          commissionId: 3,
          status: 'ORDER_QUOTING',
        }),
      },
    });
  });

  it('preserves the current commissions URL as the return path when opening estimate detail', async () => {
    useCommission.mockReturnValue({
      commissions: [
        {
          commissionId: 3,
          status: 'ORDER_QUOTING',
          title: 'Quotation waiting commission',
          inputImageUrl: 'input.png',
          style: 'Ghibli',
        },
      ],
      fetchCommissions: vi.fn().mockResolvedValue(),
      loading: false,
      pageInfo: { totalPages: 1, totalElements: 1 },
    });

    render(
      <MemoryRouter initialEntries={['/commissions?page=2']}>
        <CheckCommissionPage />
      </MemoryRouter>,
    );

    const detailButton = await screen.findByRole('button', {
      name: /Quotation waiting commission/i,
    });
    fireEvent.click(detailButton);

    expect(mockNavigate).toHaveBeenCalledWith('/orders/estimate-detail?commissionId=3', {
      state: expect.objectContaining({
        returnTo: '/commissions?page=2',
      }),
    });
  });

  it('opens the completed payment order detail page when payment is complete', async () => {
    useCommission.mockReturnValue({
      commissions: [
        {
          commissionId: 2,
          orderId: 102,
          status: 'PAID',
          title: '강아지 의뢰',
          aiImageUrl: 'paid-dog.png',
        },
      ],
      fetchCommissions: vi.fn().mockResolvedValue(),
      loading: false,
      pageInfo: { totalPages: 1, totalElements: 1 },
    });

    render(
      <BrowserRouter>
        <CheckCommissionPage />
      </BrowserRouter>,
    );

    const detailButton = await screen.findByRole('button', {
      name: /강아지 의뢰 상세 보기/i,
    });
    fireEvent.click(detailButton);

    expect(mockNavigate).toHaveBeenCalledWith('/payments/102', {
      state: {
        commissionId: 2,
        order: expect.objectContaining({
          commissionId: 2,
          orderId: 102,
          status: 'PAID',
        }),
      },
    });
  });

  it('opens the completed payment order detail page by commission id when order id is missing', async () => {
    useCommission.mockReturnValue({
      commissions: [
        {
          commissionId: 8,
          status: 'PAYMENT_COMPLETED',
          title: '주문 아이디 없는 결제 완료 의뢰',
        },
      ],
      fetchCommissions: vi.fn().mockResolvedValue(),
      loading: false,
      pageInfo: { totalPages: 1, totalElements: 1 },
    });

    render(
      <BrowserRouter>
        <CheckCommissionPage />
      </BrowserRouter>,
    );

    const detailButton = await screen.findByRole('button', {
      name: /주문 아이디 없는 결제 완료 의뢰 상세 보기/i,
    });
    fireEvent.click(detailButton);

    expect(mockNavigate).toHaveBeenCalledWith('/payments/8', {
      state: {
        commissionId: 8,
      },
    });
  });

  it('does not open a commission while asset creation is in progress', async () => {
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});

    useCommission.mockReturnValue({
      commissions: [
        {
          commissionId: 3,
          status: 'ASSET_CREATING',
          title: '에셋 생성 중 의뢰',
        },
      ],
      fetchCommissions: vi.fn().mockResolvedValue(),
      loading: false,
      pageInfo: { totalPages: 1, totalElements: 1 },
    });

    render(
      <BrowserRouter>
        <CheckCommissionPage />
      </BrowserRouter>,
    );

    const detailButton = await screen.findByRole('button', {
      name: /에셋 생성 중 의뢰 상세 보기/i,
    });
    fireEvent.click(detailButton);

    expect(mockNavigate).not.toHaveBeenCalledWith(
      expect.stringContaining('/commissions/check/3'),
      expect.anything(),
    );
    expect(mockNavigate).not.toHaveBeenCalledWith(
      expect.stringContaining('/commissions/result/3'),
      expect.anything(),
    );
    expect(alertSpy).toHaveBeenCalled();
  });

  it('disables a commission card while AI image generation is in progress', async () => {
    useCommission.mockReturnValue({
      commissions: [
        {
          commissionId: 4,
          status: 'AI_IMAGE_PROCESSING',
          title: 'AI 이미지 생성 중 의뢰',
        },
      ],
      fetchCommissions: vi.fn().mockResolvedValue(),
      loading: false,
      pageInfo: { totalPages: 1, totalElements: 1 },
    });

    render(
      <BrowserRouter>
        <CheckCommissionPage />
      </BrowserRouter>,
    );

    const detailButton = await screen.findByRole('button', {
      name: /AI 이미지 생성 중 의뢰 상세 보기/i,
    });

    expect(detailButton).toBeDisabled();
    fireEvent.click(detailButton);
    expect(mockNavigate).not.toHaveBeenCalledWith(
      expect.stringContaining('/commissions/check/4'),
      expect.anything(),
    );
  });

  it('disables a failed commission card and does not open it', async () => {
    useCommission.mockReturnValue({
      commissions: [
        {
          commissionId: 5,
          status: 'FAILED',
          title: 'Failed commission',
        },
      ],
      fetchCommissions: vi.fn().mockResolvedValue(),
      loading: false,
      pageInfo: { totalPages: 1, totalElements: 1 },
    });

    render(
      <BrowserRouter>
        <CheckCommissionPage />
      </BrowserRouter>,
    );

    const detailButton = await screen.findByRole('button', {
      name: /Failed commission/i,
    });

    expect(detailButton).toBeDisabled();
    fireEvent.click(detailButton);
    expect(mockNavigate).not.toHaveBeenCalledWith(
      expect.stringContaining('/commissions/check/5'),
      expect.anything(),
    );
  });

  it('opens the order entry page when asset creation is complete', async () => {
    useCommission.mockReturnValue({
      commissions: [
        {
          commissionId: 2,
          status: 'ASSET_CREATED',
          title: '에셋 생성 완료 의뢰',
          aiImageUrl: 'asset-created.png',
          style: 'Ghibli',
        },
      ],
      fetchCommissions: vi.fn().mockResolvedValue(),
      loading: false,
      pageInfo: { totalPages: 1, totalElements: 1 },
    });

    render(
      <BrowserRouter>
        <CheckCommissionPage />
      </BrowserRouter>,
    );

    const detailButton = await screen.findByRole('button', {
      name: /에셋 생성 완료 의뢰 상세 보기/i,
    });
    fireEvent.click(detailButton);

    expect(mockNavigate).toHaveBeenCalledWith('/commissions/result/2', {
      state: {
        detail: expect.objectContaining({
          commissionId: 2,
          status: 'ASSET_CREATED',
        }),
      },
    });
  });

  it('navigates to the bulletin board when clicking "다른 모델 보러가기"', async () => {
    useCommission.mockReturnValue({
      commissions: [],
      fetchCommissions: vi.fn().mockResolvedValue(),
      loading: false,
      pageInfo: { totalPages: 1, totalElements: 0 },
    });

    render(
      <BrowserRouter>
        <CheckCommissionPage />
      </BrowserRouter>,
    );

    const boardButton = await screen.findByText(/다른 모델 보러가기/i);
    fireEvent.click(boardButton);

    expect(mockNavigate).toHaveBeenCalledWith('/bulletinboard');
  });

  it('navigates to the copied asset list when clicking "Assets 목록"', async () => {
    useCommission.mockReturnValue({
      commissions: [],
      fetchCommissions: vi.fn().mockResolvedValue(),
      loading: false,
      pageInfo: { totalPages: 1, totalElements: 0 },
    });

    render(
      <BrowserRouter>
        <CheckCommissionPage />
      </BrowserRouter>,
    );

    const assetButton = await screen.findByRole('button', { name: 'Assets 목록' });
    fireEvent.click(assetButton);

    expect(mockNavigate).toHaveBeenCalledWith('/asset');
  });
});
