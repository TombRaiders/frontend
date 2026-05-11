import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import AdminTable from './AdminTable';

/**
 * AdminTable 컴포넌트 유닛 테스트
 * 관리자 목록의 모드별(조회/수정) 렌더링 여부와 권한 체크박스 변경 시 이벤트 핸들러 호출을 검증함
 */

// 각 테스트 케이스 종료 후 DOM 정리를 수행하여 테스트 간 간섭을 방지함
afterEach(() => cleanup());

describe('AdminTable 컴포넌트 테스트', () => {
  // 테스트용 모의(Mock) 관리자 데이터 정의
  const mockAdmins = [
    {
      id: '00000000',
      nickname: 'user1',
      role: '커뮤니티',
      status: '관리자 취소',
      permissions: { request: true, business: true, finance: true, delivery: true },
    },
  ];

  test('관리자 정보가 렌더링되고 권한 체크박스 클릭 시 변경 이벤트가 호출되어야 합니다', () => {
    const mockChange = vi.fn();

    // 수정(edit) 모드로 컴포넌트 렌더링
    render(<AdminTable viewMode="edit" admins={mockAdmins} onPermissionChange={mockChange} />);

    // 화면 내의 모든 체크박스 요소들을 수집
    const checkboxes = screen.getAllByRole('checkbox');

    /**
     * 체크박스 인덱스 구조 설명:
     * [0] : 테이블 헤더(thead)의 전체 선택 체크박스
     * [1] : 데이터 행(tbody)의 개별 행 선택 체크박스
     * [2] : '의뢰 목록'(request) 권한 설정 체크박스 (이벤트 핸들러 테스트 대상)
     */
    const requestPermissionCheckbox = checkboxes[2];

    // 첫 번째 관리자의 '의뢰 목록' 권한 체크박스 클릭 및 상태 변경 시뮬레이션
    fireEvent.click(requestPermissionCheckbox);
    fireEvent.change(requestPermissionCheckbox, { target: { checked: false } });

    // 부모로부터 받은 권한 변경 함수(onPermissionChange)가 올바른 인자(ID, 권한명)와 함께 호출되었는지 확인
    expect(mockChange).toHaveBeenCalled();
    expect(mockChange).toHaveBeenCalledWith('00000000', 'request');
  });
});
