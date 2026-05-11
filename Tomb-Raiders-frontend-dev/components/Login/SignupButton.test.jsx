import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import SignupButton from './SignupButton';

/**
 * SignupButton 컴포넌트 유닛 테스트
 * 회원가입 양식 내 버튼의 라벨 렌더링, 사용자 클릭 시 콜백 함수(onClick) 호출,
 * 그리고 버튼 타입(버튼/제출용) 속성 적용을 검증함
 */

describe('SignupButton 컴포넌트 테스트', () => {
  // 테스트용 모의 vw 함수
  const mockVw = (val) => `${val}px`;

  // 각 테스트 종료 후 DOM 상태를 초기화함
  afterEach(cleanup);

  it('Props로 전달된 라벨(label) 텍스트가 버튼 내부에 정상적으로 나타나야 합니다', () => {
    render(<SignupButton label="가입하기" vw={mockVw} />);

    // 버튼 역할(Role)과 이름(Name)을 기반으로 해당 버튼 요소 확인
    const buttonElement = screen.getByRole('button', { name: '가입하기' });
    expect(buttonElement).toBeInTheDocument();
  });

  it('버튼 클릭 시 상위 컴포넌트에서 전달한 클릭 핸들러(onClick)가 호출되어야 합니다', () => {
    const mockOnClick = vi.fn();
    render(<SignupButton label="클릭테스트" vw={mockVw} onClick={mockOnClick} />);

    // 클릭 시뮬레이션 및 호출 횟수 검증
    const buttonElement = screen.getByRole('button', { name: '클릭테스트' });
    fireEvent.click(buttonElement);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('type 속성을 명시하지 않을 경우 기본값으로 "button" 타입을 가져야 합니다', () => {
    render(<SignupButton label="기본타입" vw={mockVw} />);

    const buttonElement = screen.getByRole('button', { name: '기본타입' });
    expect(buttonElement).toHaveAttribute('type', 'button');
  });

  it('type 속성을 "submit"으로 설정할 경우 폼 제출용 버튼 속성이 적용되어야 합니다', () => {
    render(<SignupButton label="제출타입" vw={mockVw} type="submit" />);

    const buttonElement = screen.getByRole('button', { name: '제출타입' });
    expect(buttonElement).toHaveAttribute('type', 'submit');
  });
});
