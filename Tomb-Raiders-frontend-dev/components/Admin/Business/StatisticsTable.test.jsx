import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatisticsTable from './StatisticsTable';

/**
 * StatisticsTable 컴포넌트 유닛 테스트
 * 데이터가 없을 때도 테이블 레이아웃 유지를 위해 빈 행이 올바르게 생성되는지 검증함
 */
describe('StatisticsTable 컴포넌트 테스트', () => {
  it('데이터가 비어있어도 디자인 유지를 위해 빈 행 5개가 생성되어야 합니다', () => {
    const { container } = render(<StatisticsTable data={[]} />);
    const tbody = container.querySelector('tbody');

    // 빈 행(TableRow) 5개 생성 여부 확인
    expect(tbody.querySelectorAll('tr')).toHaveLength(5);
  });
});
