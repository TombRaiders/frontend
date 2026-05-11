import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import MainCard from './MainCard';

/**
 * MainCard 컴포넌트 유닛 테스트
 * 홈페이지 메인 홍보 카드의 라벨(label) 텍스트 렌더링,
 * 화면 비율에 따른 동적 폰트 크기(vw) 적용, 그리고 배경/테두리 스타일을 검증함
 */

describe('MainCard 컴포넌트 테스트', () => {
  // 테스트용 모의 vw 함수: 입력된 수치에 'px'를 붙여 반환하도록 설정함
  const mockVw = (px) => `${px}px`;

  it('Props로 전달된 라벨(label) 텍스트가 카드 내부에 정상적으로 표시되어야 합니다', () => {
    const testLabel = '제작 의뢰하기';
    render(<MainCard label={testLabel} vw={mockVw} />);

    // 텍스트 존재 여부 확인
    expect(screen.getByText(testLabel)).toBeInTheDocument();
  });

  it('vw 함수를 통해 계산된 폰트 크기(30px)가 인라인 스타일에 정확하게 반영되어야 합니다', () => {
    const testLabel = '테스트 카드';
    render(<MainCard label={testLabel} vw={mockVw} />);

    const cardElement = screen.getByText(testLabel);

    // 내부 로직(vw(30))에 따라 30px 스타일이 적용되었는지 검증
    expect(cardElement).toHaveStyle({
      fontSize: '30px',
    });
  });

  it('Tailwind CSS 클래스를 통한 배경색(흰색) 및 테두리 스타일이 요소에 적용되어야 합니다', () => {
    const { container } = render(<MainCard label="스타일 테스트" vw={mockVw} />);
    const cardDiv = container.firstChild;

    // 정의된 Tailwind 배경 및 테두리 색상 클래스 존재 확인
    expect(cardDiv).toHaveClass('bg-[#FFFFFF]');
    expect(cardDiv).toHaveClass('border-[#B4B4B4]');
  });
});
