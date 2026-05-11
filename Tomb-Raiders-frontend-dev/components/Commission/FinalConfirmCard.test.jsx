import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import FinalConfirmCard from './FinalConfirmCard';

describe('FinalConfirmCard 컴포넌트 테스트', () => {
  const mockProps = {
    aiImg: 'test-ai-image.jpg',
    style: '실사 피규어',
    title: '나만의 캐릭터 의뢰',
    onBackToList: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal('innerWidth', 1920);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();

    Object.defineProperty(globalThis, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });

    globalThis.dispatchEvent(new Event('resize'));
  });

  test('전달된 이미지, 스타일, 제목이 화면에 올바르게 표시되는가?', () => {
    render(<FinalConfirmCard {...mockProps} />);

    // 이미지 렌더링 확인 (alt 속성 이용)
    const img = screen.getByAltText('최종본');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBe(mockProps.aiImg);

    // 스타일 및 타이틀 텍스트 확인
    expect(screen.getByText(mockProps.style)).toBeInTheDocument();
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
  });

  test('"의뢰 목록으로" 버튼 클릭 시 onBackToList 함수가 호출되는가?', () => {
    render(<FinalConfirmCard {...mockProps} />);

    const backBtn = screen.getByText('의뢰 목록으로');
    fireEvent.click(backBtn);

    expect(mockProps.onBackToList).toHaveBeenCalledTimes(1);
  });

  test('"견적 신청하기" 버튼 클릭 시 onSubmit 함수가 호출되는가?', () => {
    render(<FinalConfirmCard {...mockProps} />);

    const submitBtn = screen.getByText('견적 신청하기');
    fireEvent.click(submitBtn);

    expect(mockProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  test('디자인 수치(vw)가 포함된 스타일이 적용되어 있는가?', () => {
    render(<FinalConfirmCard {...mockProps} />);

    const titleElement = screen.getByText('견적 신청 확인');
    const style = globalThis.getComputedStyle(titleElement);
    expect(Number.parseFloat(style.fontSize)).toBeCloseTo(32, 0);
  });
});
