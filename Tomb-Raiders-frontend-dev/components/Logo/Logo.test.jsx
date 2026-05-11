import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { test, expect, vi, describe, beforeEach } from 'vitest';
import Logo from './Logo';

// 💡 1. useNavigate 훅이 어떤 경로로 이동하려는지 추적하기 위해 가짜 함수로 만듭니다.
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate, // 우리가 만든 가짜 함수를 반환하도록 가로챕니다.
  };
});

describe('Logo 컴포넌트 테스트', () => {
  // 컴포넌트에 넘겨줄 가짜 vw 함수 (단순히 px 뒤에 'vw'를 붙여 반환)
  const mockVw = (px) => `${px}vw`;

  // 각 테스트가 시작되기 전에 가짜 함수의 호출 기록을 깨끗하게 지워줍니다.
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('로고 이미지가 정상적으로 렌더링되어야 합니다', () => {
    render(<Logo vw={mockVw} />);

    // 버튼 역할을 하는 요소 중에 '로고이미지'라는 이름을 가진 요소를 찾습니다.
    const logoButton = screen.getByRole('button', { name: '로고이미지' });
    expect(logoButton).toBeInTheDocument();
    expect(logoButton).toHaveStyle({ width: '180vw', height: '108vw' });
    expect(screen.getByRole('img', { name: '로고이미지' })).toHaveAttribute('src', '/logo.png');
  });

  test('로고를 클릭하면 메인 홈페이지(/)로 이동해야 합니다', () => {
    render(<Logo vw={mockVw} />);

    const logoButton = screen.getByRole('button', { name: '로고이미지' });

    // 로고 버튼 클릭!
    fireEvent.click(logoButton);

    // 💡 클릭 후 navigate 함수가 '/' 경로를 인자로 받아서 실행되었는지 검증합니다.
    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(mockNavigate).toHaveBeenCalledTimes(1); // 딱 1번만 눌렸는지도 확인
  });

  test('외부에서 전달된 커스텀 style prop이 덮어씌워져야 합니다', () => {
    // 마진을 추가하는 커스텀 스타일
    const customStyle = { marginTop: '20px' };

    render(<Logo vw={mockVw} style={customStyle} />);

    const logoButton = screen.getByRole('button', { name: '로고이미지' });

    // 전달한 marginTop 속성이 인라인 스타일로 잘 적용되었는지 확인합니다.
    expect(logoButton).toHaveStyle('margin-top: 20px');
  });
});
