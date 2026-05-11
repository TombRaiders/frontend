import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import LoginInput from './LoginInput';

/**
 * LoginInput 컴포넌트 유닛 테스트
 * 로그인 입력 필드(아이디, 비밀번호 등)의 플레이스홀더 렌더링,
 * 입력 타입(text, password) 속성 적용, 그리고 하단 테두리(borderBottom) 스타일을 검증함
 */

describe('LoginInput 컴포넌트 테스트', () => {
  // 테스트용 모의 vw 함수
  const mockVw = (px) => `${px}px`;

  it('Props로 전달된 플레이스홀더와 입력 타입(type) 속성이 올바르게 설정되어야 합니다', () => {
    render(<LoginInput type="password" placeholder="비밀번호를 입력하세요" vw={mockVw} />);

    const input = screen.getByPlaceholderText('비밀번호를 입력하세요');
    expect(input).toBeInTheDocument();

    // 입력된 타입(비밀번호 숨김 처리용) 검증
    expect(input).toHaveAttribute('type', 'password');
  });

  it('vw 함수를 통해 계산된 하단 테두리 두께(borderBottomWidth) 스타일이 정확하게 적용되어야 합니다', () => {
    render(<LoginInput type="text" placeholder="아이디" vw={mockVw} />);

    const input = screen.getByPlaceholderText('아이디');

    // 내부 로직(vw(1.2))에 따라 1.2px 스타일이 적용되었는지 확인
    expect(input).toHaveStyle({
      borderBottomWidth: '1.2px',
    });
  });
});
