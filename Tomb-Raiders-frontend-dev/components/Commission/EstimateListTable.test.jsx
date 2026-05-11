import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import EstimateListTable from './EstimateListTable';
import '@testing-library/jest-dom';

describe('EstimateListTable 컴포넌트 테스트', () => {
  const mockEstimates = [
    {
      id: 1,
      title: '피규어 A',
      style: '실사',
      qty: 1,
      price: 10000,
      sender: '판매자1',
      img: 'thumb1.jpg',
    },
    {
      id: 2,
      title: '피규어 B',
      style: '캐주얼',
      qty: 2,
      price: 20000,
      sender: '판매자2',
      img: 'thumb2.jpg',
    },
  ];
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
    // vw 계산 시 필요한 window.innerWidth 설정
    globalThis.innerWidth = 1920;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('전달된 견적서 리스트가 모두 테이블에 렌더링되는가?', () => {
    render(
      <EstimateListTable
        estimates={mockEstimates}
        onSelect={mockOnSelect}
        selectedEstimateId={null}
      />,
    );

    // 제목이 리스트 개수만큼 있는지 확인
    expect(screen.getByText('피규어 A')).toBeInTheDocument();
    expect(screen.getByText('피규어 B')).toBeInTheDocument();

    // 금액 포맷팅 확인 (10,000원 형식)
    expect(screen.getByText('10,000원')).toBeInTheDocument();
    expect(screen.getByText('20,000원')).toBeInTheDocument();
  });

  test('행(Row)을 클릭했을 때 onSelect 함수가 올바른 ID와 함께 호출되는가?', () => {
    render(
      <EstimateListTable
        estimates={mockEstimates}
        onSelect={mockOnSelect}
        selectedEstimateId={null}
      />,
    );

    // 두 번째 견적서 행 클릭 (텍스트로 해당 행을 찾아 클릭)
    const secondRow = screen.getByText('피규어 B').closest('tr');
    fireEvent.click(secondRow);

    // id가 2인 견적서가 선택되었는지 확인
    expect(mockOnSelect).toHaveBeenCalledWith(2);
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  test('선택된 견적서(selectedEstimateId)의 라디오 버튼이 체크되어 있는가?', () => {
    render(
      <EstimateListTable
        estimates={mockEstimates}
        onSelect={mockOnSelect}
        selectedEstimateId={1}
      />,
    );

    const radioButtons = screen.getAllByRole('radio');

    // 첫 번째 행의 라디오 버튼은 체크되어 있어야 함
    expect(radioButtons[0]).toBeChecked();
    // 두 번째 행은 체크되어 있지 않아야 함
    expect(radioButtons[1]).not.toBeChecked();
  });

  test('선택된 행에 하이라이트 배경색(#F0FFF4)이 적용되는가?', () => {
    render(
      <EstimateListTable
        estimates={mockEstimates}
        onSelect={mockOnSelect}
        selectedEstimateId={1}
      />,
    );

    const firstRow = screen.getByText('피규어 A').closest('tr');

    // 스타일 객체에 배경색이 포함되었는지 확인
    // ※ 주의: 브라우저 환경에 따라 rgb 값으로 변환되어 체크될 수 있음 (rgb(255, 249, 240))
    expect(firstRow).toHaveStyle('background-color: #F0FFF4');
  });
});
