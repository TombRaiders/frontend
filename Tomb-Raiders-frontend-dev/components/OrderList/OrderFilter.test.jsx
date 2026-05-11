import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import OrderFilter from './OrderFilter';

describe('OrderFilter 컴포넌트 테스트', () => {
  const mockProps = {
    filter: '오늘',
    setFilter: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('innerWidth', 1920); // vw 단위 계산을 위한 설정
  });

  test('모든 필터 옵션 버튼("오늘", "1개월", "6개월" 등)이 렌더링되는가?', () => {
    render(<OrderFilter {...mockProps} />);

    const options = ['오늘', '1개월', '6개월', '1년', '전체'];
    options.forEach((opt) => {
      expect(screen.getByText(opt)).toBeInTheDocument();
    });

    // 조회 버튼 확인
    expect(screen.getByRole('button', { name: '조회' })).toBeInTheDocument();
  });

  test('현재 선택된 필터("오늘")에 하이라이트 스타일이 적용되어 있는가?', () => {
    render(<OrderFilter {...mockProps} />);

    const activeBtn = screen.getByText('오늘');

    // 배경색이 #2C9753(오렌지)인지 확인
    // ※ 주의: 실제 렌더링 시 rgb(255, 149, 0)로 보일 수 있음
    expect(activeBtn).toHaveStyle('background-color: #2C9753');
    expect(activeBtn).toHaveStyle('color: #fff');

    // 선택되지 않은 버튼 스타일 확인
    const inactiveBtn = screen.getByText('1개월');
    expect(inactiveBtn).toHaveStyle('background-color: #fff');
    expect(inactiveBtn).toHaveStyle('color: #000');
  });

  test('필터 옵션 클릭 시 setFilter 함수가 클릭된 값과 함께 호출되는가?', () => {
    render(<OrderFilter {...mockProps} />);

    const targetBtn = screen.getByText('6개월');
    fireEvent.click(targetBtn);

    expect(mockProps.setFilter).toHaveBeenCalledWith('6개월');
    expect(mockProps.setFilter).toHaveBeenCalledTimes(1);
  });
});
