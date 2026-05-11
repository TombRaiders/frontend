import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import StyleSelectForm from './StyleSelectForm';

describe('StyleSelectForm 컴포넌트 테스트', () => {
  const mockProps = {
    style: '지브리',
    setStyle: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('innerWidth', 1920);
  });

  test('라벨과 선택 박스, 버튼이 정상적으로 렌더링되는가?', () => {
    render(<StyleSelectForm {...mockProps} />);

    expect(screen.getByLabelText('스타일 선택')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /이미지 전송하기/i })).toBeInTheDocument();
  });

  test('초기 style 프로프 값이 select 박스에 올바르게 설정되어 있는가?', () => {
    render(<StyleSelectForm {...mockProps} />);

    const select = screen.getByRole('combobox');
    expect(select.value).toBe('지브리');
  });

  test('다른 옵션을 선택하면 setStyle 함수가 호출되는가?', () => {
    render(<StyleSelectForm {...mockProps} />);

    const select = screen.getByRole('combobox');

    // '실사'로 값 변경 시뮬레이션
    fireEvent.change(select, { target: { value: '실사' } });

    expect(mockProps.setStyle).toHaveBeenCalledWith('실사');
    expect(mockProps.setStyle).toHaveBeenCalledTimes(1);
  });

  test('버튼 클릭 시 onSubmit 함수가 호출되는가?', () => {
    render(<StyleSelectForm {...mockProps} />);

    const submitBtn = screen.getByRole('button', { name: /이미지 전송하기/i });
    fireEvent.click(submitBtn);

    expect(mockProps.onSubmit).toHaveBeenCalledTimes(1);
  });
});
