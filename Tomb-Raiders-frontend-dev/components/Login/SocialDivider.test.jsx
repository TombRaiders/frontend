import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import SocialDivider from './SocialDivider';

/**
 * SocialDivider 컴포넌트 유닛 테스트
 * 로그인 양식 하단의 소셜 로그인 구분선 텍스트 렌더링과
 * vw 함수를 통한 동적 간격(marginTop) 스타일 적용을 검증함
 */

describe('SocialDivider 컴포넌트 테스트', () => {
  // 테스트용 모의 vw 함수
  const mockVw = (px) => `${px}px`;

  it('Props로 전달된 안내 문구가 구분선 중앙에 정상적으로 표시되어야 합니다', () => {
    render(<SocialDivider text="또는 소셜 계정으로 로그인" vw={mockVw} />);

    // 텍스트 존재 확인
    expect(screen.getByText('또는 소셜 계정으로 로그인')).toBeInTheDocument();
  });

  it('vw 함수를 통해 계산된 상단 여백(marginTop: 80px) 스타일이 정확하게 적용되어야 합니다', () => {
    const { container } = render(<SocialDivider text="OR" vw={mockVw} />);
    const dividerContainer = container.firstChild;

    // 내부 로직(marginTop: vw(80))에 따라 80px 스타일이 적용되었는지 검토
    expect(dividerContainer).toHaveStyle({
      marginTop: '80px',
    });
  });
});
