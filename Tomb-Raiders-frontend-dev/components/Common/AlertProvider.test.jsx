import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { AlertProvider, useAlert } from './AlertProvider';

// CustomAlertModal을 모킹하여 테스트가 내부 UI에 의존하지 않도록 단순화합니다.
vi.mock('./CustomAlertModal', () => {
  return {
    default: ({ isOpen, onClose, title, description }) => {
      if (!isOpen) return null;
      return (
        <div data-testid="alert-modal">
          <h1>{title}</h1>
          <p>{description}</p>
          <button onClick={onClose}>Close</button>
        </div>
      );
    },
  };
});

// 테스트용 하위 컴포넌트
function TestComponent({ message, onCloseCallback }) {
  const { showAlert } = useAlert();
  return (
    <button type="button" onClick={() => showAlert(message, onCloseCallback)}>
      Trigger Alert
    </button>
  );
}

describe('AlertProvider 컴포넌트 테스트', () => {
  let originalAlert;

  beforeEach(() => {
    originalAlert = globalThis.alert;
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.alert = originalAlert;
  });

  it('children이 정상적으로 렌더링되는가?', () => {
    render(
      <AlertProvider>
        <div data-testid="child">Hello World</div>
      </AlertProvider>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('useAlert().showAlert를 호출하면 커스텀 모달이 열리는가?', async () => {
    render(
      <AlertProvider>
        <TestComponent message="테스트 알림" />
      </AlertProvider>,
    );

    fireEvent.click(screen.getByText('Trigger Alert'));

    expect(screen.getByTestId('alert-modal')).toBeInTheDocument();
    expect(screen.getByText('테스트 알림')).toBeInTheDocument();
  });

  it('모달의 닫기 버튼을 누르면 알림이 닫히고 onClose 콜백이 호출되는가?', async () => {
    const onCloseMock = vi.fn();
    render(
      <AlertProvider>
        <TestComponent message="테스트 알림" onCloseCallback={onCloseMock} />
      </AlertProvider>,
    );

    fireEvent.click(screen.getByText('Trigger Alert'));
    expect(screen.getByTestId('alert-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close'));

    await waitFor(() => {
      expect(screen.queryByTestId('alert-modal')).not.toBeInTheDocument();
    });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('globalThis.alert를 호출해도 커스텀 모달로 알림이 뜨는가?', async () => {
    render(
      <AlertProvider>
        <div>Content</div>
      </AlertProvider>,
    );

    act(() => {
      globalThis.alert('글로벌 알림');
    });

    expect(screen.getByTestId('alert-modal')).toBeInTheDocument();
    expect(screen.getByText('글로벌 알림')).toBeInTheDocument();
  });

  it('여러 개의 알림이 연속으로 발생할 때 대기열(Queue)에 보관되었다가 순차적으로 열리는가?', async () => {
    render(
      <AlertProvider>
        <TestComponent message="첫 번째 알림" />
        <TestComponent message="두 번째 알림" />
      </AlertProvider>,
    );

    const triggerButtons = screen.getAllByText('Trigger Alert');
    fireEvent.click(triggerButtons[0]); // 첫 번째 버튼
    fireEvent.click(triggerButtons[1]); // 두 번째 버튼

    // 첫 번째 알림 노출
    expect(screen.getByTestId('alert-modal')).toBeInTheDocument();
    expect(screen.getByText('첫 번째 알림')).toBeInTheDocument();

    // 첫 번째 알림 닫기
    fireEvent.click(screen.getByText('Close'));

    // 두 번째 알림이 연이어 열려야 함
    await waitFor(() => {
      expect(screen.getByText('두 번째 알림')).toBeInTheDocument();
    });
  });
});
