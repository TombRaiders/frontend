import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import '@testing-library/jest-dom/vitest';
import ShippingAddressOverlay from './ShippingAddressOverlay';

/**
 * ShippingAddressOverlay 컴포넌트 유닛 테스트
 * HTML5 <dialog> 요소를 활용한 모달 오버레이의 렌더링,
 * 배경 클릭 시 닫기 발생 여부, 내부 콘텐츠 클릭 시 닫힘 방지,
 * 그리고 ESC(Cancel) 이벤트 대응 로직을 검증함
 */

describe('ShippingAddressOverlay 컴포넌트 테스트', () => {
  const mockOnClose = vi.fn();

  // jsdom 환경에서 <dialog> 요소의 메서드(showModal, close)가 구현되어 있지 않으므로
  // 테스트 실행 전에 수동으로 모킹하여 에러를 방지함
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  // 각 테스트 종료 후 DOM 상태 및 모킹 기록을 초기화함
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Props로 전달된 자식 요소(children)가 오버레이 내부에 정상적으로 나타나야 합니다', () => {
    render(
      <ShippingAddressOverlay onClose={mockOnClose}>
        <div data-testid="child">테스트 콘텐츠</div>
      </ShippingAddressOverlay>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('컴포넌트가 마운트(Mount)될 때 <dialog>의 showModal 메서드가 호출되어야 합니다', () => {
    render(
      <ShippingAddressOverlay onClose={mockOnClose}>
        <div>콘텐츠</div>
      </ShippingAddressOverlay>,
    );
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('오버레이 배경(dialog 자체)을 클릭했을 때만 onClose 함수가 호출되어야 합니다', () => {
    const { container } = render(
      <ShippingAddressOverlay onClose={mockOnClose}>
        <div data-testid="content">콘텐츠</div>
      </ShippingAddressOverlay>,
    );

    const dialog = container.querySelector('dialog');

    // 배경 클릭 시뮬레이션: 이벤트 타겟이 dialog인 경우
    fireEvent.click(dialog);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('오버레이 내부의 실제 콘텐츠 영역을 클릭했을 때는 onClose가 호출되지 않아야 합니다', () => {
    render(
      <ShippingAddressOverlay onClose={mockOnClose}>
        <div data-testid="content">콘텐츠</div>
      </ShippingAddressOverlay>,
    );

    const content = screen.getByTestId('content');

    // 내부 영역 클릭 시뮬레이션
    fireEvent.click(content);

    // 이벤트 버블링이 발생하더라도 타겟 조건에 맞지 않으므로 닫히지 않아야 함
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('사용자가 ESC 키를 눌러 브라우저 차원의 cancel 이벤트가 발생할 때 onClose가 호출되어야 합니다', () => {
    const { container } = render(
      <ShippingAddressOverlay onClose={mockOnClose}>
        <div>콘텐츠</div>
      </ShippingAddressOverlay>,
    );

    const dialog = container.querySelector('dialog');

    // HTML5 <dialog> 표준 cancel 이벤트 발생 시뮬레이션
    fireEvent(dialog, new Event('cancel'));

    expect(mockOnClose).toHaveBeenCalled();
  });
});
