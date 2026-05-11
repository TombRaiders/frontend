import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import ShippingAddressButton from './ShippingAddressButton';

/**
 * ShippingAddressButton 컴포넌트 유닛 테스트
 * 버튼의 텍스트 렌더링, 클릭 이벤트 핸들러 호출, 그리고 타입(주황/흰색)에 따른
 * 배경색 및 너비 스타일의 동적 적용을 검증함
 */

// 스타일 유틸리티(vw) 모킹
vi.mock('../../../utils/style', () => ({
  vw: (size) => `${size}px`,
}));

describe('ShippingAddressButton 컴포넌트 테스트', () => {
  // 각 테스트 종료 후 DOM 상태를 초기화하여 요소 중복 찾기 에러를 방지함
  afterEach(() => {
    cleanup();
  });

  it('Props로 전달된 텍스트가 버튼 내부에 정상적으로 렌더링되어야 합니다', () => {
    render(<ShippingAddressButton text="배송지 추가" />);

    // 버튼 역할(Role)과 이름(Name)을 기반으로 정확한 요소 확인
    expect(screen.getByRole('button', { name: '배송지 추가' })).toBeInTheDocument();
  });

  it('버튼 클릭 시 상위 컴포넌트의 클릭 핸들러(onClick)가 호출되어야 합니다', () => {
    const handleClick = vi.fn();
    render(<ShippingAddressButton text="클릭" onClick={handleClick} />);

    const button = screen.getByRole('button', { name: '클릭' });
    fireEvent.click(button);

    // 함수 호출 횟수 검증
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('type 속성이 "orange"일 경우 지정된 주황색 배경 스타일이 적용되어야 합니다', () => {
    render(<ShippingAddressButton text="주황" type="orange" />);
    const button = screen.getByRole('button', { name: '주황' });

    // 배경색 Hex 코드 검증
    expect(button).toHaveStyle({ background: '#2C9753' });
  });

  it('width 속성값에 따라 버튼의 너비가 동적으로 설정되어야 합니다', () => {
    const customWidth = 120;
    render(<ShippingAddressButton text="넓은 버튼" width={customWidth} />);
    const button = screen.getByRole('button', { name: '넓은 버튼' });

    // 인라인 스타일 너비 값 확인
    expect(button.style.width).toBe(`${customWidth}px`);
  });

  it('type 속성이 없을 경우 기본값으로 흰색 배경 스타일이 적용되어야 합니다', () => {
    render(<ShippingAddressButton text="기본" />);
    const button = screen.getByRole('button', { name: '기본' });

    // 기본 화이트 스타일 검증
    expect(button).toHaveStyle({ background: '#fff' });
    expect(button).toHaveStyle({ color: '#333' });
  });
});
