import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import GuidePage from './GuidePage';

// 💡 HeaderSection 및 TopUtility에서 사용하는 인증 유틸리티 모킹
vi.mock('../../utils/authUtils', () => ({
  getToken: vi.fn(() => null),
  getUserRole: vi.fn(() => null),
  clearAuth: vi.fn(),
}));

describe('GuidePage 페이지 테스트', () => {
  // 각 테스트 종료 후 DOM 상태를 초기화함
  afterEach(() => cleanup());

  it('가이드 페이지 진입 시 메인 타이틀과 가이드 내용들이 정상적으로 렌더링되어야 합니다', () => {
    // 💡 필수 Props 함수들을 모킹(vi.fn())하여 컴포넌트 렌더링
    render(
      <BrowserRouter>
        <GuidePage
          goToSignup={vi.fn()}
          goToLogin={vi.fn()}
          goToCommissionCheck={vi.fn()}
          goToMember={vi.fn()}
          goToBulletinBoard={vi.fn()}
          goToAdmin={vi.fn()}
          goToPartner={vi.fn()}
          goToGuide={vi.fn()}
        />
      </BrowserRouter>,
    );

    // 💡 해결 1: 헤더 버튼과 본문 텍스트가 중복되므로 getAllByText를 사용합니다.
    expect(screen.getAllByText('의뢰').length).toBeGreaterThan(0);
    expect(screen.getAllByText('가이드').length).toBeGreaterThan(0);
    expect(
      screen.getByText(/이 가이드는 고객님의 소중한 아이디어가 완벽한 결과물로/i),
    ).toBeInTheDocument();

    // 2. 가이드 섹션 제목 확인
    const titlePrefixes = screen.getAllByText('3D 프린터');
    expect(titlePrefixes.length).toBe(3);

    const titleSuffixes = screen.getAllByText('제작 대행');
    expect(titleSuffixes.length).toBe(3);

    // 3. 소제목 렌더링 확인
    const serviceDescTitles = screen.getAllByText('서비스 설명 영역');
    expect(serviceDescTitles.length).toBe(3);

    const precautionTitles = screen.getAllByText('주의사항');
    expect(precautionTitles.length).toBe(3);

    // 4. 세부 텍스트 내용 일부가 정상적으로 출력되었는지 확인
    const specificDesc = screen.getAllByText(
      /디지털 3D 파일\(STL\/OBJ\/3MF\)을 기반으로 실물 출력물을 제작해 드리는/i,
    );
    expect(specificDesc.length).toBe(3);

    const specificPrecaution = screen.getAllByText(
      /파일 내 오류\(바디망개, 구멍 뚫림 등\)는 출력 전 반드시 수정 필요/i,
    );
    expect(specificPrecaution.length).toBe(3);
  });
});
