import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import ShippingContent from './ShippingContent';

/**
 * ShippingContent 컴포넌트 유닛 테스트
 * 배송지 주소록의 전체 목록 렌더링, 기본 배송지 표시 여부,
 * 그리고 행 선택을 위한 체크박스들의 생성 개수를 검증함
 */

// 1. 스타일 유틸리티 모킹
vi.mock('../../../utils/style', () => ({
  vw: (size) => `${size}px`,
}));

// 2. 모달 컴포넌트 모킹: 목록 렌더링 테스트에 집중하기 위해 하위 모달은 단순화함
vi.mock('./ShippingAddressModal', () => ({
  default: () => <div data-testid="mock-modal" />,
}));

describe('ShippingContent 컴포넌트 테스트', () => {
  // 테스트용 모의 배송지 데이터 정의
  const mockAddresses = [
    {
      addressId: 1,
      addressTitle: '우리집',
      recipientName: '홍길동',
      address: '서울시...',
      detailAddress: '101호',
      isDefault: true,
    },
    {
      addressId: 2,
      addressTitle: '회사',
      recipientName: '홍길동',
      address: '판교...',
      detailAddress: '2CMD',
      isDefault: false,
    },
  ];
  const mockSetAddresses = vi.fn();

  // 각 테스트 종료 후 DOM 상태를 초기화함
  afterEach(() => {
    cleanup();
  });

  it('배송지 관리 섹션의 타이틀이 정상적으로 화면에 표시되어야 합니다', () => {
    render(<ShippingContent addresses={mockAddresses} setAddresses={mockSetAddresses} />);
    expect(screen.getByText('배송지 주소록 관리')).toBeInTheDocument();
  });

  it('전달된 배송지 데이터들이 테이블 내 행(Row)으로 올바르게 렌더링되어야 합니다', () => {
    render(<ShippingContent addresses={mockAddresses} setAddresses={mockSetAddresses} />);

    // 배송지명 존재 확인
    expect(screen.getByText('우리집')).toBeInTheDocument();
    expect(screen.getByText('회사')).toBeInTheDocument();

    // 기본 배송지 뱃지(텍스트) 확인
    expect(screen.getByText('기본')).toBeInTheDocument();
  });

  it('체크박스의 총 개수는 데이터 행 개수와 상단 전체 선택 헤더를 포함한 수치여야 합니다', () => {
    render(<ShippingContent addresses={mockAddresses} setAddresses={mockSetAddresses} />);
    const checkboxes = screen.getAllByRole('checkbox');

    // 데이터 행 2개 + 헤더 영역 전체 선택 체크박스 1개 = 총 3개 확인
    expect(checkboxes).toHaveLength(mockAddresses.length + 1);
  });
});
