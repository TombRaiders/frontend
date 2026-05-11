import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import ApplicantTable from './ApplicantTable';

/**
 * ApplicantTable 컴포넌트 유닛 테스트
 * 신규 관리자 신청자 목록의 데이터 렌더링 정상 여부를 검증함
 */

// 각 테스트 케이스 종료 후 DOM 정리를 수행함
afterEach(() => cleanup());

describe('ApplicantTable 컴포넌트 테스트', () => {
  // 테스트용 모의(Mock) 신청자 데이터 및 함수 정의
  const mockApplicants = [
    { id: '00000000', nickname: 'user1', date: '2026.03.26', role: '비즈니스' },
  ];
  const mockOnApprove = vi.fn();
  const mockOnReject = vi.fn();

  test('신청자 목록의 제목과 사용자 닉네임, 담당 역할 데이터가 화면에 올바르게 표시되어야 합니다', () => {
    render(
      <ApplicantTable
        applicants={mockApplicants}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />,
    );

    // 제목 영역 텍스트 포함 여부 확인
    expect(screen.getByText(/신규 관리자 신청자 목록/)).toBeInTheDocument();

    // 테이블 내 실제 데이터 렌더링 확인
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('비즈니스')).toBeInTheDocument();
  });
});
