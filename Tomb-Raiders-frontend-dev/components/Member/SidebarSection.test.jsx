import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SidebarSection from './SidebarSection';
import * as authUtils from '../../utils/authUtils';

// 1. 의존성 모킹
vi.mock('../../utils/style', () => ({
  vw: (val) => `${val}vw`,
}));

vi.mock('../../api/apiClient', () => ({
  post: vi.fn(),
}));

// getUserRole을 개별 제어할 수 있게 모킹
vi.mock('../../utils/authUtils', () => ({
  getUserRole: vi.fn(),
}));

describe('SidebarSection 컴포넌트 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('이미 파트너 또는 관리자인 경우 파트너 신청 버튼이 비활성화되어야 합니다', () => {
    /**
     * 💡 [체크포인트 1] 컴포넌트 내부 로직 확인 필요
     * 만약 SidebarSection.jsx에서 role을 'ADMIN'이 아니라 '파트너 회원' 혹은 '관리자'라는
     * 한글 문자열로 비교하고 있다면, 아래 값을 그에 맞춰 바꿔야 합니다.
     */
    const adminRole = 'ADMIN';

    // 1. 쿠키 리턴값 모킹
    vi.mocked(authUtils.getUserRole).mockReturnValue(adminRole);

    // 2. 렌더링 시 props로도 확실히 전달 (컴포넌트가 props를 우선할 수 있음)
    // 💡 [체크포인트 2] currentRole={adminRole}을 명시적으로 전달해보세요.
    render(<SidebarSection currentRole={adminRole} />);

    // 버튼을 가져올 때 정확히 '파트너 신청하기' 텍스트를 포함하는지 확인
    const applyBtn = screen.getByRole('button', { name: /파트너 신청하기/ });

    /**
     * 💡 [체크포인트 3] 디버깅 팁
     * 만약 여기서 또 실패한다면, expect 바로 위에 console.log(applyBtn.outerHTML)을 찍어보세요.
     * disabled 속성이 왜 안 들어갔는지 컴포넌트 내부의 if문을 다시 봐야 합니다.
     */
    expect(applyBtn).toBeDisabled();
  });

  // ... 나머지 테스트 코드는 이전과 동일 (생략)
});
