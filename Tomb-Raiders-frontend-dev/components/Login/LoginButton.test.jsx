import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import LoginButton from './LoginButton';

/**
 * LoginButton 컴포넌트 유닛 테스트
 * 로그인 버튼의 라벨(label) 텍스트 렌더링 여부와
 * 디자인 가이드에 따른 배경색(주황색) Tailwind 클래스 적용 상태를 검증함
 */

describe('LoginButton 컴포넌트 테스트', () => {
  // 테스트용 모의 vw 함수: 입력 수치에 'px'를 붙여 반환하도록 설정함
  const mockVw = (px) => `${px}px`;

  // 각 테스트 종료 후 렌더링된 DOM을 초기화하여 테스트 간 간섭을 방지함
  afterEach(() => {
    cleanup();
  });

  it('Props로 전달된 라벨이 버튼의 텍스트로 올바르게 표시되어야 합니다', () => {
    render(<LoginButton label="로그인" vw={mockVw} />);

    // 버튼 역할(Role)과 이름(Name)을 기반으로 해당 버튼 요소 확인
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  it('버튼 요소에 지정된 주황색 배경색 Tailwind 클래스가 포함되어 있어야 합니다', () => {
    render(<LoginButton label="확인" vw={mockVw} />);

    // 렌더링된 버튼 요소의 클래스 리스트 검증
    const button = screen.getByRole('button', { name: '확인' });
    expect(button.className).toContain('bg-[#2C9753]');
  });
});
