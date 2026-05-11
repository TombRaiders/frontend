import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import Footer from './Footer';

describe('Footer 컴포넌트 테스트', () => {
  afterEach(() => cleanup());

  // vw 함수 모킹 (px 값을 그대로 px 단위 문자열로 반환하여 렌더링 에러 방지)
  const mockVw = (px) => `${px}px`;

  it('푸터 내의 로고와 텍스트 내용들이 정상적으로 렌더링되어야 합니다', () => {
    render(
      <BrowserRouter>
        <Footer vw={mockVw} />
      </BrowserRouter>,
    );

    // 💡 수정됨: 텍스트('웹로고') 대신 이미지의 alt 속성('웹로고')을 찾도록 변경
    expect(screen.getByAltText('웹로고')).toBeInTheDocument();

    // 2. 푸터의 주요 텍스트들이 배열에서 정상적으로 풀려나와 화면에 표시되는지 확인
    expect(screen.getByText(/상호명 : Makertion \| 대표자명 : 황성현/i)).toBeInTheDocument();
    expect(screen.getByText(/이용약관 \| 개인정보처리방침/i)).toBeInTheDocument();
    expect(screen.getByText(/Copyright © Makertion/i)).toBeInTheDocument();
  });
});
