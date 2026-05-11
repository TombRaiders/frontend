import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import SignupInput from './SignupInput';

/**
 * SignupInput 컴포넌트 유닛 테스트
 * 회원가입 양식의 개별 입력 필드(이메일, 아이디, 비밀번호 등)의
 * 속성(name, type, placeholder) 렌더링, 값 입력 시의 상태 변경,
 * 그리고 필수 입력(required) 및 초기값 설정 여부를 검증함
 */

describe('SignupInput 컴포넌트 테스트', () => {
  // 테스트용 모의 vw 함수
  const mockVw = (val) => `${val}px`;

  // 각 테스트 종료 후 DOM 상태를 초기화함
  afterEach(cleanup);

  it('Props로 전달된 이름(name), 타입(type), 플레이스홀더가 입력창에 정확히 설정되어야 합니다', () => {
    render(<SignupInput name="email" type="email" placeholder="이메일을 입력하세요" vw={mockVw} />);

    const inputElement = screen.getByPlaceholderText('이메일을 입력하세요');

    // 요소의 존재 및 HTML 속성 검증
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('type', 'email');
    expect(inputElement).toHaveAttribute('name', 'email');
  });

  it('사용자가 텍스트를 입력할 때 상위 컴포넌트의 onChange 함수가 호출되어야 합니다', () => {
    const mockOnChange = vi.fn();
    render(
      <SignupInput
        name="loginId"
        type="text"
        placeholder="아이디"
        vw={mockVw}
        onChange={mockOnChange}
      />,
    );

    const inputElement = screen.getByPlaceholderText('아이디');

    // 타이핑 이벤트 시뮬레이션
    fireEvent.change(inputElement, { target: { value: 'tester' } });

    // 콜백 함수 호출 여부 확인
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('전달받은 초기값(value)과 필수 여부(required) 속성이 입력창에 올바르게 적용되어야 합니다', () => {
    render(
      <SignupInput
        name="password"
        type="password"
        placeholder="비밀번호"
        vw={mockVw}
        value="mySecret123!"
        required
        onChange={vi.fn()}
      />,
    );

    const inputElement = screen.getByPlaceholderText('비밀번호');

    // 현재 입력된 값 및 필수 입력 속성 검증
    expect(inputElement).toHaveValue('mySecret123!');
    expect(inputElement).toBeRequired();
  });
});
