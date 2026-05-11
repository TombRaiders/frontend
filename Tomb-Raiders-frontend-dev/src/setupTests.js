import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Vitest의 expect 객체에 jest-dom 매처를 추가합니다.
expect.extend(matchers);

// 1. vw 유틸리티 모킹 (단위 테스트를 위해 px 값을 그대로 반환하도록 설정)
vi.mock('./src/utils/style', () => ({
  vw: (px) => `${px}vw`,
}));

// 2. react-router-dom의 useNavigate 모킹
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 각 테스트 케이스가 끝날 때마다 JSDOM의 내용을 비워 중복 요소를 방지합니다.
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

export { mockNavigate };
