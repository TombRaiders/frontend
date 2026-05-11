import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import ImageUploadCard from './ImageUploadCard';

describe('ImageUploadCard 컴포넌트 테스트', () => {
  // Ref 객체 모킹
  const mockClick = vi.fn();

  const mockRef = {
    current: {
      click: mockClick,
    },
  };
  const mockOnFileChange = vi.fn();

  beforeEach(() => {
    mockClick.mockClear();
    vi.clearAllMocks();
    vi.stubGlobal('innerWidth', 1920);
  });

  test('미리보기 URL이 없을 때 업로드 플레이스홀더가 표시되는가?', () => {
    render(
      <ImageUploadCard fileInputRef={mockRef} onFileChange={mockOnFileChange} previewUrl={null} />,
    );

    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('이미지를 클릭해 업로드하세요')).toBeInTheDocument();
  });

  test('미리보기 URL이 있을 때 이미지가 정상적으로 표시되는가?', () => {
    const testUrl = 'test-preview.jpg';
    render(
      <ImageUploadCard
        fileInputRef={mockRef}
        onFileChange={mockOnFileChange}
        previewUrl={testUrl}
      />,
    );

    const img = screen.getByAltText('미리보기');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', testUrl);
  });

  test('카드 클릭 시 hidden input의 click 메서드가 호출되는가?', () => {
    render(
      <ImageUploadCard fileInputRef={mockRef} onFileChange={mockOnFileChange} previewUrl={null} />,
    );

    // 버튼 역할을 하는 카드 클릭
    const input = document.querySelector('input[type="file"]');
    const clickSpy = vi.spyOn(input, 'click');

    const uploadButton = screen.getByRole('button');
    fireEvent.click(uploadButton);
    expect(clickSpy).toHaveBeenCalled();

    clickSpy.mockRestore();
  });

  test('파일 선택 시 onFileChange 함수가 호출되는가?', () => {
    render(
      <ImageUploadCard fileInputRef={mockRef} onFileChange={mockOnFileChange} previewUrl={null} />,
    );

    // 숨겨진 input 요소를 찾음 (display: none이라도 querySelector 등으로 접근 가능)
    const input = document.querySelector('input[type="file"]');

    // 파일 업로드 이벤트 시뮬레이션
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(mockOnFileChange).toHaveBeenCalledTimes(1);
  });
});
