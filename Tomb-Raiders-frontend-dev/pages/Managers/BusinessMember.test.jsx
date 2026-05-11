import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import BusinessMember from './BusinessMember';

/**
 * BusinessMember 페이지 유닛 테스트
 * 비즈니스 파트너 회원 목록 조회 페이지의
 * 초기 타이틀("비지니스 회원 목록") 렌더링 여부를 검증함
 */

describe('BusinessMember 페이지 테스트', () => {
  it('비지니스 회원 목록 페이지의 메인 타이틀이 화면에 정상적으로 나타나야 합니다', () => {
    // 내부 페이지 이동 링크 처리를 위해 MemoryRouter 환경에서 렌더링
    render(
      <MemoryRouter>
        <BusinessMember />
      </MemoryRouter>,
    );

    // 페이지 제목 명칭 확인
    expect(screen.getByText('비지니스 회원 목록')).toBeInTheDocument();
  });
});
