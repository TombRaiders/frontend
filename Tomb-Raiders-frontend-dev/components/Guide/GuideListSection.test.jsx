import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import GuideListSection from './GuideListSection';

describe('GuideListSection 컴포넌트 테스트', () => {
  afterEach(() => cleanup());

  const mockVw = (px) => `${px}px`;

  // 테스트에 사용할 가짜(Mock) 데이터 준비
  const mockProps = {
    title: '테스트용 타이틀',
    items: ['첫 번째 항목입니다.', '두 번째 항목입니다.'],
    itemColor: '#ff0000', // 빨간색 테스트
    vw: mockVw,
  };

  it('전달받은 타이틀과 리스트 항목들이 화면에 정상적으로 출력되어야 합니다', () => {
    render(<GuideListSection {...mockProps} />);

    // 타이틀 텍스트 확인
    expect(screen.getByText('테스트용 타이틀')).toBeInTheDocument();

    // 배열로 전달한 리스트 항목 확인
    expect(screen.getByText('첫 번째 항목입니다.')).toBeInTheDocument();
    expect(screen.getByText('두 번째 항목입니다.')).toBeInTheDocument();
  });

  it('전달된 색상(itemColor)과 여백(hasMarginBottom) 속성이 올바르게 스타일로 적용되어야 합니다', () => {
    // hasMarginBottom을 true로 주어 렌더링
    const { container } = render(<GuideListSection {...mockProps} hasMarginBottom />);

    // 1. 색상 스타일 확인 (jsdom 환경에서 hex 코드는 rgb로 변환됨)
    const listItem = screen.getByText('첫 번째 항목입니다.');
    expect(listItem).toHaveStyle({ color: 'rgb(255, 0, 0)' });

    // 2. 하단 여백(margin) 확인 (wrapper div 요소 탐색)
    const wrapperDiv = container.firstChild;
    expect(wrapperDiv).toHaveStyle({ marginBottom: '35px' }); // mockVw(35)의 결과
  });

  it('hasMarginBottom이 false일 때 하단 여백이 0이어야 합니다', () => {
    const { container } = render(<GuideListSection {...mockProps} hasMarginBottom={false} />);

    const wrapperDiv = container.firstChild;
    expect(wrapperDiv).toHaveStyle({ marginBottom: '0px' });
  });
});
