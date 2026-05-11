import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import CustomAlertModal from './CustomAlertModal';

// useAlert 훅을 통해 알림 제어를 수행할 수 있도록 AlertContext 생성
const AlertContext = createContext(null);

/**
 * useAlert 커스텀 훅
 * 컴포넌트 영역에서 커스텀 모달 알림 및 닫기 완료 콜백(onClose)을 연동할 수 있도록 도와줍니다.
 */
export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    // 💡 AlertProvider 하위가 아닌 독립 환경(예: 단위 테스트)을 위한 Fallback 방어 코드
    return {
      showAlert: (message, onClose) => {
        const originalAlert = globalThis.alert;
        if (typeof originalAlert === 'function') {
          // 원래의 브라우저 기본 alert를 실행한 후 onClose 콜백을 연이어 작동시킵니다.
          originalAlert(message);
        } else {
          console.log(`[Alert Fallback]: ${message}`);
        }
        if (typeof onClose === 'function') {
          onClose();
        }
      },
    };
  }
  return context;
}

/**
 * AlertProvider 컴포넌트
 * 브라우저의 기본 globalThis.alert 기능을 가로채어, 커스텀 모달인 CustomAlertModal을 렌더링합니다.
 * 연속으로 알림이 발생할 경우 알림이 유실되지 않도록 대기열(Queue)에 보관 후 순차적으로 노출합니다.
 */
export function AlertProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // 새로운 알림 요청이 들어왔을 때 대기열(Queue)에 { message, onClose } 형태로 저장하여 기존의 onClose 기능 지원
  const showAlert = useCallback((message, onClose) => {
    setQueue((prev) => [...prev, { message, onClose }]);
  }, []);

  // 유저가 제공한 triggerAlert와 완벽 호환 (메시지 대기열에 추가)
  const triggerAlert = useCallback((message) => {
    setQueue((prev) => [...prev, message]);
  }, []);

  useEffect(() => {
    // 마운트 시 브라우저 기본 alert 백업 및 덮어쓰기
    const originalAlert = globalThis.alert;

    globalThis.alert = (message) => {
      triggerAlert(message);
    };

    // 언마운트 시 브라우저 기본 alert 복원
    return () => {
      globalThis.alert = originalAlert;
    };
  }, [triggerAlert]);

  // 대기열을 모니터링하여, 현재 열려있는 알림이 없고 대기열에 메시지가 있으면 하나씩 꺼내 활성화
  useEffect(() => {
    if (!isOpen && queue.length > 0) {
      const nextAlert = queue[0];
      setQueue((prev) => prev.slice(1));
      setCurrentAlert(nextAlert);
      setIsOpen(true);
    }
  }, [queue, isOpen]);

  // 커스텀 모달 닫기 이벤트 핸들러
  const handleClose = useCallback(() => {
    setIsOpen(false);

    // 객체 형태이고 onClose 콜백이 존재하면 안전하게 트리거
    if (
      currentAlert &&
      typeof currentAlert === 'object' &&
      typeof currentAlert.onClose === 'function'
    ) {
      currentAlert.onClose();
    }

    setCurrentAlert(null);
  }, [currentAlert]);

  const contextValue = useMemo(() => ({ showAlert }), [showAlert]);

  // currentAlert가 객체 형태일 때와 단순 문자열 형태일 때 모두 안전하게 내용 추출
  const alertDescription = useMemo(() => {
    if (!currentAlert) return '';
    if (typeof currentAlert === 'object') {
      return currentAlert.message || '';
    }
    return String(currentAlert);
  }, [currentAlert]);

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      <CustomAlertModal
        isOpen={isOpen}
        onClose={handleClose}
        title="알림"
        description={alertDescription}
      />
    </AlertContext.Provider>
  );
}

AlertProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AlertProvider;
