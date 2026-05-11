import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import LoginCard from './LoginCard';

/**
 * LoginCard 컴포넌트 유닛 테스트
 * 로그인 및 회원가입 페이지에서 공통으로 사용되는 카드 레이아웃의
 * 제목(title) 렌더링과 자식 요소(children) 포함 여부를 검증함
 */

describe('LoginCard 컴포넌트 테스트', () => {
  // 테스트용 모의 vw 함수
  const mockVw = (px) => `${px}px`;

  it('Props로 전달된 제목과 내부 컨텐츠(자식 요소)가 화면에 올바르게 표시되어야 합니다', () => {
    render(
      <LoginCard title="로그인" vw={mockVw}>
        <div data-testid="child">테스트 컨텐츠</div>
      </LoginCard>,
    );

    // 제목 텍스트 존재 확인
    expect(screen.getByText('로그인')).toBeInTheDocument();

    // 주입된 자식 요소의 렌더링 확인
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
