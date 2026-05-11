import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import BusinessManager from './BusinessManager';

/**
 * BusinessManager 페이지 유닛 테스트
 * 판매 관리 대시보드의 초기 진입 시 타이틀(판매 관리)과
 * 주요 상태 요약 카드(신규견적 등)의 정상적인 렌더링을 검증함
 */

describe('BusinessManager 페이지 테스트', () => {
  it('판매 관리 대시보드의 제목과 주요 상태 요약 카드들이 화면에 나타나야 합니다', () => {
    // 하위 내비게이션 링크 처리를 위해 MemoryRouter로 감싸 렌더링
    render(
      <MemoryRouter>
        <BusinessManager />
      </MemoryRouter>,
    );

    // 페이지 제목 확인
    expect(screen.getByText('판매 관리')).toBeInTheDocument();

    // 신규 견적 등 대시보드 상태 카드 렌더링 확인
    expect(screen.getByText('신규견적')).toBeInTheDocument();
  });
});
