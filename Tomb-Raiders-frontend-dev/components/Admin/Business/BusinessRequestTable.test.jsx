import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BusinessRequestTable from './BusinessRequestTable';

/**
 * BusinessRequestTable 컴포넌트 유닛 테스트
 * 새로운 비즈니스 신청 내역의 렌더링 여부와 내역이 없을 때의 안내 메시지 표시를 검증함
 */
describe('BusinessRequestTable 컴포넌트 테스트', () => {
  // 테스트용 모의(Mock) 함수 및 데이터 정의
  const mockOnApprove = vi.fn();
  const mockOnReject = vi.fn();
  const mockOnView = vi.fn();

  const mockData = [
    {
      partnerId: 10,
      memberId: 'req_user',
      name: '테스트 업체',
      contact: '010-1234-5678',
      location: '서울',
    },
  ];

  it('신청 데이터가 있을 때 상세, 수락, 거절 버튼이 정상적으로 렌더링되어야 합니다', () => {
    render(
      <BusinessRequestTable
        data={mockData}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onView={mockOnView}
      />,
    );

    // 각 기능 버튼들이 화면에 나타나는지 확인
    expect(screen.getByText('상세')).toBeInTheDocument();
    expect(screen.getByText('수락')).toBeInTheDocument();
    expect(screen.getByText('거절')).toBeInTheDocument();
  });

  it('데이터가 없을 때 "신청 내역이 없습니다." 메시지를 화면에 출력해야 합니다', () => {
    render(
      <BusinessRequestTable
        data={[]}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onView={mockOnView}
      />,
    );

    // 빈 배열 전달 시 안내 문구 확인
    expect(screen.getByText('신청 내역이 없습니다.')).toBeInTheDocument();
  });
});
