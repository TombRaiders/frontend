import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import CreateAssetCard from './CreateAssetCard';
import '@testing-library/jest-dom';

// 1. useNavigate 모킹 (이동 경로 확인용 가짜 함수)
const mockedUsedNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

describe('CreateAssetCard 컴포넌트 테스트', () => {
  // vw 단위를 계산하는 간단한 가짜 함수 (Mock vw)
  const mockVw = (size) => `${size}px`;

  beforeEach(() => {
    // 각 테스트 시작 전 모킹 함수 초기화
    mockedUsedNavigate.mockClear();
  });

  test('카드에 "+" 아이콘과 "새로운 의뢰" 텍스트가 정상적으로 렌더링되는가?', () => {
    render(
      <BrowserRouter>
        <CreateAssetCard vw={mockVw} />
      </BrowserRouter>,
    );
  });

  test('카드에 "+" 아이콘과 "새로운 의뢰" 텍스트가 정상적으로 렌더링되는가?', () => {
    render(
      <BrowserRouter>
        <CreateAssetCard vw={mockVw} />
      </BrowserRouter>,
    );

    // "+" 아이콘 확인
    expect(screen.getByText('+')).toBeInTheDocument();
    // "새로운 의뢰" 텍스트 확인
    expect(screen.getByText('새로운 의뢰')).toBeInTheDocument();
  });

  test('카드 클릭 시 /commission 경로로 navigate가 호출되는가?', () => {
    render(
      <BrowserRouter>
        <CreateAssetCard vw={mockVw} />
      </BrowserRouter>,
    );

    // 버튼 요소(카드)를 찾아 클릭 발생
    const cardButton = screen.getByRole('button');
    fireEvent.click(cardButton);

    // 정확한 경로('/commission')로 이동 요청했는지 검증
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/commission');
  });

  test('전달된 vw 함수를 사용하여 스타일이 올바르게 적용되었는가?', () => {
    render(
      <BrowserRouter>
        <CreateAssetCard vw={mockVw} />
      </BrowserRouter>,
    );

    const cardButton = screen.getByRole('button');
    // vw(800)이 800px로 잘 변환되어 적용되었는지 스타일 체크
    expect(cardButton).toHaveStyle('width: 800px');
    expect(cardButton).toHaveStyle('border-width: 2px');
    expect(cardButton).toHaveStyle('border-style: dashed');
    expect(cardButton).toHaveStyle('border-color: rgb(180, 180, 180)');
  });
});
