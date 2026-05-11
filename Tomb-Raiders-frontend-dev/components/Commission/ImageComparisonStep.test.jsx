import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import ImageComparisonStep from './ImageComparisonStep';
import '@testing-library/jest-dom';

describe('ImageComparisonStep 컴포넌트 테스트', () => {
  const mockProps = {
    originalImg: 'original.jpg',
    aiImg: 'ai-generated.jpg',
    style: '지브리',
    setStyle: vi.fn(),
    onRegenerate: vi.fn(),
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('innerWidth', 1920); // vw 계산용
  });

  beforeEach(() => {
    vi.clearAllMocks(); // 📍 jest -> vi
    vi.stubGlobal('innerWidth', 1920); // 📍 vw 계산 보장을 위한 stub 설정
  });

  test('원본 이미지와 생성된 이미지가 올바른 src로 렌더링되는가?', () => {
    render(<ImageComparisonStep {...mockProps} />);

    const originalImg = screen.getByAltText('원본');
    const aiImg = screen.getByAltText('생성본');

    expect(originalImg).toHaveAttribute('src', 'original.jpg');
    expect(aiImg).toHaveAttribute('src', 'ai-generated.jpg');
  });

  test('스타일 선택(Select) 변경 시 setStyle 함수가 호출되는가?', () => {
    render(<ImageComparisonStep {...mockProps} />);

    const select = screen.getByRole('combobox');

    // 스타일을 '픽사'로 변경
    fireEvent.change(select, { target: { value: '픽사' } });

    expect(mockProps.setStyle).toHaveBeenCalledWith('픽사');
  });

  test('이미지 재생성하기 버튼 클릭 시 onRegenerate 함수가 호출되는가?', () => {
    render(<ImageComparisonStep {...mockProps} />);

    const regenerateBtn = screen.getByText('이미지 재생성하기');
    fireEvent.click(regenerateBtn);

    expect(mockProps.onRegenerate).toHaveBeenCalledTimes(1);
  });

  test('이미지 생성 완료 버튼 클릭 시 onConfirm 함수가 호출되는가?', () => {
    render(<ImageComparisonStep {...mockProps} />);

    const confirmBtn = screen.getByText('이미지 생성 완료');
    fireEvent.click(confirmBtn);

    expect(mockProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  test('AI 이미지 생성 중이면 원본 대체 이미지를 흐리게 보여주고 완료 버튼을 비활성화한다', () => {
    render(<ImageComparisonStep {...mockProps} aiImg="original.jpg" isAiImagePending />);

    const aiImg = screen.getByAltText('생성본');
    const confirmBtn = screen.getByRole('button', { name: '이미지 생성 중...' });

    expect(aiImg).toHaveAttribute('src', 'original.jpg');
    expect(aiImg).toHaveStyle({ opacity: '0.45' });
    expect(screen.getByText('AI 이미지 생성 중')).toBeInTheDocument();
    expect(confirmBtn).toBeDisabled();
  });

  test('전달된 style 프로프가 select 박스의 초기값으로 설정되어 있는가?', () => {
    render(<ImageComparisonStep {...mockProps} />);

    const select = screen.getByRole('combobox');
    expect(select.value).toBe('지브리');
  });
});
