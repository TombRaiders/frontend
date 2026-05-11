import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest'; // 💡 jest-dom 매처 임포트 (toBeInTheDocument 등 사용을 위함)
import CommonAdminModal from './CommonAdminModal'; // 💡 컴포넌트 임포트 확인

// 스타일 유틸리티 모킹
vi.mock('../../../utils/style', () => ({
  vw: (size) => `${size}px`,
}));

describe('CommonAdminModal 컴포넌트 테스트', () => {
  // 💡 defaultProps를 describe 블록 내에 정의하여 no-undef 에러 해결
  const defaultProps = {
    isOpen: true,
    title: '테스트 모달',
    icon: '🚀',
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    submitText: '확인',
    submitColor: '#EF4444',
  };

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Props로 전달된 제목과 아이콘이 표시되어야 합니다.', () => {
    // 💡 render 함수와 screen 객체는 상단에서 import 했으므로 이제 사용 가능합니다.
    render(
      <CommonAdminModal {...defaultProps}>
        <div>Content</div>
      </CommonAdminModal>,
    );

    expect(screen.getByText('테스트 모달')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('모달 배경(Overlay) 및 컨테이너 스타일이 올바르게 적용되어야 합니다.', () => {
    render(
      <CommonAdminModal {...defaultProps}>
        <div>Content</div>
      </CommonAdminModal>,
    );

    const modalTitle = screen.getByText('테스트 모달');
    // h3(제목) -> div(컨테이너) -> div(오버레이) 구조 탐색
    const modalContainer = modalTitle.closest('div');
    const overlay = modalContainer?.parentElement;

    expect(overlay).toHaveStyle({
      position: 'fixed',
      display: 'flex',
      zIndex: '9999',
    });
  });
});
