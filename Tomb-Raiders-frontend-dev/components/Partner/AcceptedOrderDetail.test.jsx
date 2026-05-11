import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import AcceptedOrderDetail from './AcceptedOrderDetail';

describe('AcceptedOrderDetail', () => {
  it('renders user order information, asset image, and asset download button', () => {
    render(
      <AcceptedOrderDetail
        selectedOrder={{
          orderId: 21,
          status: 'PAYMENT_COMPLETED',
          manufacturingMethod: 'FDM',
          requirements: 'fresh paid order detail',
          quantity: 3,
          memberId: 77,
          addressCode: '06236',
          address: '서울 강남구 테헤란로 1',
          detailAddress: '3층',
          assetImageUrl: 'https://files.example.com/preview.png',
          assetUrl: 'https://files.example.com/model.stl',
          paymentStatus: 'PAID',
          createdAt: '2026-04-25T00:00:00',
          updatedAt: '2026-04-26T00:00:00',
        }}
      />,
    );

    expect(screen.getByText('사용자 주문 정보')).toBeInTheDocument();
    expect(screen.getByText('주문 번호 : 21')).toBeInTheDocument();
    expect(screen.getByText('배송지 : (06236) 서울 강남구 테헤란로 1 3층')).toBeInTheDocument();
    expect(screen.getByAltText('Asset 이미지')).toHaveAttribute(
      'src',
      'https://files.example.com/preview.png',
    );
    const downloadLink = screen.getByRole('link', { name: 'Asset 다운로드' });
    expect(downloadLink).toHaveAttribute('href', 'https://files.example.com/model.stl');
    expect(downloadLink).toHaveClass('rounded-full');
    expect(downloadLink).toHaveClass('bg-[#16A34A]');
    expect(downloadLink).toHaveClass('box-border');
    expect(downloadLink).toHaveClass('max-w-full');
    expect(downloadLink).not.toHaveClass('hover:-translate-y-0.5');
    expect(screen.getByText('↓')).toBeInTheDocument();
    expect(screen.queryByText('견적서 작성')).not.toBeInTheDocument();
  });

  it('shows an empty guide before selecting an order', () => {
    render(<AcceptedOrderDetail selectedOrder={null} />);

    expect(
      screen.getByText('주문 목록에서 상세를 확인할 주문을 선택해주세요.'),
    ).toBeInTheDocument();
  });
});
