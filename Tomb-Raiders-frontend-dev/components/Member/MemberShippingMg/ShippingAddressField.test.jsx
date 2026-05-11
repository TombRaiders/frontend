import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import ShippingAddressField from './ShippingAddressField';

/**
 * ShippingAddressField 컴포넌트 유닛 테스트
 * 배송지 입력 필드의 라벨 및 플레이스홀더 렌더링, 입력값 변경 시의 onChange 핸들러 호출,
 * 그리고 Props(value, width, name)에 따른 입력창 상태 및 스타일 적용을 검증함
 */

// 스타일 유틸리티(vw) 모킹
vi.mock('../../../utils/style', () => ({
  vw: (size) => `${size}px`,
}));

describe('ShippingAddressField 컴포넌트 테스트', () => {
  // 테스트용 공통 Props 및 모의 함수 정의
  const mockOnChange = vi.fn();
  const defaultProps = {
    label: '수령인',
    name: 'receiver',
    value: '',
    onChange: mockOnChange,
    placeholder: '이름을 입력하세요',
  };

  // 각 테스트 종료 후 DOM 상태 및 모킹 기록을 초기화함
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Props로 전달된 라벨과 플레이스홀더가 화면에 정상적으로 표시되어야 합니다', () => {
    render(<ShippingAddressField {...defaultProps} />);

    expect(screen.getByText('수령인')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('이름을 입력하세요')).toBeInTheDocument();
  });

  it('입력창에 텍스트를 입력하면 부모 컴포넌트의 onChange 함수가 호출되어야 합니다', () => {
    render(<ShippingAddressField {...defaultProps} />);

    const input = screen.getByPlaceholderText('이름을 입력하세요');

    // 사용자가 '홍길동'이라고 입력하는 상황 시뮬레이션
    fireEvent.change(input, { target: { value: '홍길동', name: 'receiver' } });

    // 콜백 함수 호출 여부 확인
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('전달된 value Prop이 입력창(input)의 현재 값으로 올바르게 표시되어야 합니다', () => {
    render(<ShippingAddressField {...defaultProps} value="홍길동" />);

    const input = screen.getByPlaceholderText('이름을 입력하세요');
    expect(input.value).toBe('홍길동');
  });

  it('width Prop에 따라 입력창의 너비 스타일이 동적으로 적용되어야 합니다', () => {
    const customWidth = 200;
    render(<ShippingAddressField {...defaultProps} width={customWidth} />);

    const input = screen.getByPlaceholderText('이름을 입력하세요');

    // 모킹된 vw 함수에 의해 '200px'가 적용되었는지 검증
    expect(input.style.width).toBe(`${customWidth}px`);
  });

  it('input 요소에 name 속성이 Props로 전달된 값과 일치하게 설정되어야 합니다', () => {
    render(<ShippingAddressField {...defaultProps} />);

    const input = screen.getByPlaceholderText('이름을 입력하세요');
    expect(input).toHaveAttribute('name', 'receiver');
  });
});
