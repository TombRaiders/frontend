import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import OrderIndex from './OrderIndex';

/**
 * OrderIndex 페이지 유닛 테스트
 * 주문 관리 메인 페이지의 핵심 기능 버튼(엑셀 다운 등)의
 * 정상적인 화면 렌더링 여부를 검증함
 */

describe('OrderIndex 페이지 테스트', () => {
  it('주문 관리 메인 페이지 내 "엑셀 다운" 버튼 등 주요 관리 요소가 표시되어야 합니다', () => {
    // 내부 경로 처리를 위해 MemoryRouter 환경에서 실행
    render(
      <MemoryRouter>
        <OrderIndex />
      </MemoryRouter>,
    );

    // 주문 목록 관리용 엑셀 다운로드 버튼 존재 확인
    expect(screen.getByText(/엑셀 다운/i)).toBeInTheDocument();
  });
});
