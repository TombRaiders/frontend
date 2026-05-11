import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import WebLogo from './WebLogo';

/**
 * WebLogo 컴포넌트 유닛 테스트
 * 로고 텍스트의 렌더링(alt 속성), 클릭 시 이동할 경로(targetPath), 웹 접근성을 위한
 * aria-label 설정, 그리고 사용자 정의 CSS 클래스 적용 여부를 검증함
 */

describe('WebLogo 컴포넌트 테스트', () => {
  // 라우팅 기능이 포함된 컴포넌트 렌더링을 위한 헬퍼 함수
  const renderWithRouter = (ui) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  // 각 테스트 종료 후 DOM 상태를 초기화함
  afterEach(() => cleanup());

  // 💡 수정됨: 현재 WebLogo 컴포넌트의 동작에 맞게 테스트 목적과 검증 방식을 변경했습니다.
  it('Props로 전달된 로고 텍스트가 로고 이미지의 alt 속성으로 화면에 나타나야 합니다', () => {
    renderWithRouter(<WebLogo logoText="테스트 로고" />);

    // 텍스트 대신 이미지의 alt 속성을 검증
    const imgLogo = screen.getByAltText('테스트 로고');
    expect(imgLogo).toBeInTheDocument();

    // 렌더링된 요소가 텍스트(SPAN)가 아닌 이미지(IMG) 태그인지 확인
    expect(imgLogo.tagName).toBe('IMG');
  });

  it('클릭 시 이동할 목표 경로(targetPath) 속성이 링크(<a>)에 정확히 설정되어야 합니다', () => {
    const customPath = '/admin';
    renderWithRouter(<WebLogo targetPath={customPath} />);

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', customPath);
  });

  it('스크린 리더 사용자를 위한 적절한 웹 접근성 라벨(aria-label)을 가지고 있어야 합니다', () => {
    renderWithRouter(<WebLogo logoText="마이샵" />);

    // '홈페이지로 이동' 문구가 포함된 라벨 탐색
    const linkElement = screen.getByLabelText('마이샵 홈페이지로 이동');
    expect(linkElement).toBeInTheDocument();
  });

  it('외부에서 주입된 사용자 정의 CSS 클래스명(className)이 최종 요소에 적용되어야 합니다', () => {
    const customClass = 'mt-[10px]';
    const { container } = renderWithRouter(<WebLogo className={customClass} />);

    // 첫 번째 하위 요소(링크)에 클래스가 있는지 확인
    const linkElement = container.querySelector('a');
    expect(linkElement).toHaveClass(customClass);
  });
});
