import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatisticsFilter from './StatisticsFilter';

/**
 * StatisticsFilter 컴포넌트 유닛 테스트
 * 통계 데이터를 필터링하기 위한 업체명 검색 및 검색 버튼 렌더링을 검증함
 */
describe('StatisticsFilter 컴포넌트 테스트', () => {
  it('업체명 검색 입력창과 돋보기 아이콘 버튼이 화면에 나타나야 합니다', () => {
    render(<StatisticsFilter />);

    // '업체명' 라벨과 검색 아이콘 유무 확인
    expect(screen.getByText('업체명')).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });
});
