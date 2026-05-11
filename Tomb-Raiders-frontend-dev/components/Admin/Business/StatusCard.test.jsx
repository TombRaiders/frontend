import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusCard from './StatusCard';

/**
 * StatusCard 컴포넌트 유닛 테스트
 * 전달받은 상태 라벨과 수치(count)가 올바른 단위(건)와 함께 화면에 렌더링되는지 검증함
 */
describe('StatusCard 컴포넌트 테스트', () => {
  it('전달된 라벨과 숫자가 "건" 단위와 함께 정상적으로 표시되어야 합니다', () => {
    render(<StatusCard label="신규견적" count={5} />);

    // 라벨 텍스트 확인
    expect(screen.getByText('신규견적')).toBeInTheDocument();

    // 수치 텍스트 확인
    expect(screen.getByText('5')).toBeInTheDocument();

    // 공통 단위(건) 확인
    expect(screen.getByText('건')).toBeInTheDocument();
  });
});
