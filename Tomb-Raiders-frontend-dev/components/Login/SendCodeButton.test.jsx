import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import SendCodeButton from './SendCodeButton';

/**
 * SendCodeButton 컴포넌트 유닛 테스트
 * 이메일 인증 코드 발송 버튼의 텍스트 렌더링과
 * 사용자 클릭 시의 콜백 함수(onClick) 호출을 검증함
 */

describe('SendCodeButton 컴포넌트 테스트', () => {
  it('인증 코드 보내기 버튼이 렌더링되어야 하며, 클릭 시 등록된 함수가 호출되어야 합니다', () => {
    // 클릭 이벤트를 감시하기 위한 모의 함수 정의
    const handleClick = vi.fn();

    // 모의 vw 함수와 함께 컴포넌트 렌더링
    render(<SendCodeButton onClick={handleClick} vw={(px) => `${px}px`} />);

    // 버튼 텍스트 기반 탐색 및 클릭 시뮬레이션
    const button = screen.getByText('인증 코드 보내기');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);

    // 함수 호출 여부 확인
    expect(handleClick).toHaveBeenCalled();
  });
});
