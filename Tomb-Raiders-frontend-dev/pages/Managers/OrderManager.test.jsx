import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import OrderManager from './OrderManager';
import { get } from '../../api/apiClient';

/**
 * OrderManager 페이지 유닛 테스트
 * 의뢰 관리 페이지의 타이틀("의뢰 관리") 표시 여부와
 * 비동기 API 데이터 조회가 완료되었을 때 로딩 상태가 해제되는지 검증함
 */

// API 클라이언트 모킹
vi.mock('../../api/apiClient', () => ({
  get: vi.fn(),
}));

describe('OrderManager 페이지 테스트', () => {
  it('의뢰 관리 제목이 표시되어야 하며, 데이터 로딩이 끝난 후 로딩 문구가 사라져야 합니다', async () => {
    // 빈 데이터 리스트 반환 모킹
    get.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <OrderManager />
      </MemoryRouter>,
    );

    // 페이지 제목 확인
    expect(screen.getByText('의뢰 관리')).toBeInTheDocument();

    // 비동기 데이터 로드 완료 후 로딩 메시지가 사라지는지 대기 및 확인
    await waitFor(() => {
      expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
    });
  });
});
