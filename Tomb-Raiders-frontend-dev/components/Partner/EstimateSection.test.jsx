import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import EstimateSection from './EstimateSection';
import { partnerapi } from '../../api/partnerapi';

vi.mock('../../api/partnerapi', () => ({
  partnerapi: {
    getPartnerOrderDetail: vi.fn(),
    submitQuotation: vi.fn(),
  },
}));

describe('EstimateSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the latest order detail and submits the quotation with the fresh order version', async () => {
    const showAlert = vi.fn();
    const refreshOrders = vi.fn().mockResolvedValue(undefined);

    vi.mocked(partnerapi.getPartnerOrderDetail).mockResolvedValue({
      data: { orderId: 123, version: 9 },
    });
    vi.mocked(partnerapi.submitQuotation).mockResolvedValue({});

    render(
      <EstimateSection
        selectedOrder={{
          orderId: 123,
          quantity: 2,
          memberId: 'member-1',
          createdAt: '2026-04-25T00:00:00',
          requirements: 'Make a cat figure',
          status: 'ACCEPTED',
        }}
        refreshOrders={refreshOrders}
        showAlert={showAlert}
        partnerName="Partner A"
      />,
    );

    const [unitPriceInput, shippingFeeInput] = screen.getAllByPlaceholderText('0');
    fireEvent.change(unitPriceInput, { target: { value: '10000' } });
    fireEvent.change(shippingFeeInput, { target: { value: '3000' } });
    fireEvent.change(screen.getByPlaceholderText('예: 14'), { target: { value: '14' } });

    fireEvent.click(screen.getByText('견적서 발송'));

    await waitFor(() => {
      expect(partnerapi.getPartnerOrderDetail).toHaveBeenCalledWith(123);
    });
    expect(partnerapi.submitQuotation).toHaveBeenCalledWith({
      orderId: 123,
      orderVersion: 9,
      price: 23000,
      estimatedDays: 14,
    });
    expect(showAlert).toHaveBeenCalledWith(
      '성공',
      '발송 완료',
      '견적서가 성공적으로 발송되었습니다.',
    );
    expect(refreshOrders).toHaveBeenCalled();
  });

  it('shows an error alert when any required fields are empty', async () => {
    const showAlert = vi.fn();
    const refreshOrders = vi.fn();

    render(
      <EstimateSection
        selectedOrder={{
          orderId: 123,
          quantity: 2,
          memberId: 'member-1',
          createdAt: '2026-04-25T00:00:00',
          requirements: 'Make a cat figure',
          status: 'ACCEPTED',
        }}
        refreshOrders={refreshOrders}
        showAlert={showAlert}
        partnerName="Partner A"
      />,
    );

    // 단가, 배송비, 예상 소요일을 채우지 않은 상태로 발송 시도
    fireEvent.click(screen.getByText('견적서 발송'));

    expect(showAlert).toHaveBeenCalledWith(
      '오류',
      '입력 확인',
      '예상 소요일, 단가, 수량, 배송비를 모두 입력해주세요.',
    );
    expect(partnerapi.submitQuotation).not.toHaveBeenCalled();
  });

  it('renders accepted order detail from PartnerOrderResponse fields', () => {
    render(
      <EstimateSection
        selectedOrder={{
          orderId: 123,
          version: 9,
          status: 'ACCEPTED',
          manufacturingMethod: 'FDM',
          requirements: 'Make a cat figure',
          quantity: 2,
          memberId: 77,
          addressCode: '06236',
          address: '서울 강남구 테헤란로 1',
          detailAddress: '3층',
          assetId: 44,
          assetUrl: 'https://files.example.com/model.stl',
          assetImageUrl: 'https://files.example.com/preview.png',
          commissionId: 55,
          commissionUrl: 'https://files.example.com/commission.pdf',
          paymentId: 66,
          paymentStatus: 'PAID',
          quotations: [{ quotationId: 88, price: 23000, estimatedDays: 14 }],
          createdAt: '2026-04-25T00:00:00',
          updatedAt: '2026-04-26T00:00:00',
        }}
        refreshOrders={vi.fn()}
        showAlert={vi.fn()}
        partnerName="Partner A"
      />,
    );

    expect(screen.getByText('제조 방식 : FDM')).toBeInTheDocument();
    expect(screen.getByText('배송지 : (06236) 서울 강남구 테헤란로 1 3층')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '자산 파일 열기' })).toHaveAttribute(
      'href',
      'https://files.example.com/model.stl',
    );
    expect(screen.getByRole('link', { name: '의뢰서 열기' })).toHaveAttribute(
      'href',
      'https://files.example.com/commission.pdf',
    );
    expect(screen.getByText('결제 정보 : 66 / PAID')).toBeInTheDocument();
    expect(screen.getByText('견적 목록 : 1건')).toBeInTheDocument();
  });
});
