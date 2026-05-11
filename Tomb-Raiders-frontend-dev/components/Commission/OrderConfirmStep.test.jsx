import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import OrderConfirmStep from './OrderConfirmStep';
import '@testing-library/jest-dom';

describe('OrderConfirmStep 컴포넌트 테스트', () => {
  const mockProps = {
    aiImg: 'final-result.png',
    style: '픽사 스타일',
    onBack: vi.fn(),
    onQuote: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('innerWidth', 1920); // vw 계산용
  });

  test('최종 생성된 이미지와 스타일 정보가 올바르게 표시되는가?', () => {
    render(<OrderConfirmStep {...mockProps} />);

    // 이미지 소스 확인
    const img = screen.getByAltText('최종본');
    expect(img).toHaveAttribute('src', 'final-result.png');

    // 스타일 텍스트 확인
    expect(screen.getByText('픽사 스타일')).toBeInTheDocument();

    // 고정된 생성 일자 확인 (현재 코드 기준)
    expect(screen.getByText('2026.02.11')).toBeInTheDocument();
  });

  test('"의뢰 목록으로" 버튼 클릭 시 onBack 함수가 호출되는가?', () => {
    render(<OrderConfirmStep {...mockProps} />);

    const backBtn = screen.getByText('의뢰 목록으로');
    fireEvent.click(backBtn);

    expect(mockProps.onBack).toHaveBeenCalledTimes(1);
  });

  test('"견적 신청하기" 버튼 클릭 시 onQuote 함수가 호출되는가?', () => {
    render(<OrderConfirmStep {...mockProps} />);

    const quoteBtn = screen.getByText('견적 신청하기');
    fireEvent.click(quoteBtn);

    expect(mockProps.onQuote).toHaveBeenCalledTimes(1);
  });

  test('컴포넌트 제목("생성 완료")이 올바른 폰트 크기(28px)로 렌더링되는가?', () => {
    render(<OrderConfirmStep {...mockProps} />);

    const title = screen.getByText('생성 완료');
    // vw(28) = (28/1920)*1920 = 28px
    expect(title).toHaveStyle({ fontSize: '28px' });
  });
});
