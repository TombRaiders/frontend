import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import StatisticsPage from './StatisticsPage';

/**
 * StatisticsPage 페이지 유닛 테스트
 * 통계 분석 및 정산 내역 페이지의 주요 인터페이스인
 * 기간/조건 필터 요소(돋보기 아이콘 등)의 정상적인 렌더링을 검증함
 */

describe('StatisticsPage 페이지 테스트', () => {
  it('정산 내역 조회를 위한 필터와 검색 아이콘이 화면에 정상적으로 렌더링되어야 합니다', () => {
    // 내부 내비게이션 처리를 위해 MemoryRouter 환경에서 실행
    render(
      <MemoryRouter>
        <StatisticsPage />
      </MemoryRouter>,
    );

    // 필터 영역 내 검색을 상징하는 돋보기 아이콘 존재 확인
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });
});
