import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BusinessMemberTable from './BusinessMemberTable';

/**
 * BusinessMemberTable 컴포넌트 유닛 테스트
 * 비즈니스 회원 목록의 정상적인 렌더링과 상세 보기/권한 해제 버튼의 이벤트 핸들러 호출을 검증함
 */
describe('BusinessMemberTable 컴포넌트 테스트', () => {
  // 테스트용 모의(Mock) 함수 생성
  const mockOnDelete = vi.fn();
  const mockOnView = vi.fn();

  // 테스트에 사용할 샘플 데이터 정의
  const mockData = [
    {
      partnerId: 1,
      name: '홍길동',
      memberId: 'hong123',
      contact: '010-1111-2222',
      location: '서울',
    },
    {
      id: 2,
      name: '김철수',
      memberId: 'kim456',
      contact: '010-3333-4444',
      location: '부산',
    },
  ];

  it('데이터가 빈 배열일 때 등록된 회원이 없다는 메시지를 표시해야 합니다', () => {
    render(<BusinessMemberTable data={[]} onDelete={mockOnDelete} onView={mockOnView} />);

    // 빈 데이터 입력 시 안내 문구가 화면에 나타나는지 확인
    expect(screen.getByText('등록된 비지니스 회원이 없습니다.')).toBeInTheDocument();
  });

  it('전전달된 회원 데이터를 테이블 형식에 맞춰 올바르게 렌더링해야 합니다', () => {
    render(<BusinessMemberTable data={mockData} onDelete={mockOnDelete} onView={mockOnView} />);

    // 첫 번째 회원 정보 확인
    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('(hong123)')).toBeInTheDocument();
    expect(screen.getByText('010-1111-2222')).toBeInTheDocument();

    // 두 번째 회원 정보 확인
    expect(screen.getByText('김철수')).toBeInTheDocument();
    expect(screen.getByText('부산')).toBeInTheDocument();
  });

  it('[상세] 버튼을 클릭하면 해당 회원 객체와 함께 onView 함수가 호출되어야 합니다', () => {
    render(<BusinessMemberTable data={mockData} onDelete={mockOnDelete} onView={mockOnView} />);

    // 상세 버튼들 중 첫 번째 버튼 클릭 시뮬레이션
    const viewButtons = screen.getAllByText('상세');
    fireEvent.click(viewButtons[0]);

    // 해당 회원의 전체 데이터가 인자로 전달되었는지 확인
    expect(mockOnView).toHaveBeenCalledWith(mockData[0]);
  });

  it('[권한 해제] 버튼을 클릭하면 해당 회원의 식별자와 함께 onDelete 함수가 호출되어야 합니다', () => {
    render(<BusinessMemberTable data={mockData} onDelete={mockOnDelete} onView={mockOnView} />);

    // 권한 해제 버튼들 중 두 번째 버튼 클릭 시뮬레이션
    const deleteButtons = screen.getAllByText('권한 해제');
    fireEvent.click(deleteButtons[1]);

    // 해당 회원의 ID(2)가 인자로 전달되었는지 확인
    expect(mockOnDelete).toHaveBeenCalledWith(2);
  });
});
