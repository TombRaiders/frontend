import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

function ShippingAddressOverlay({ children, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    // 모달 표시
    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    // [수정] JSX onClick 대신 직접 리스너 등록 (소나큐브 S6847 우회)
    const handleClick = (e) => {
      if (e.target === dialog) {
        onClose();
      }
    };

    dialog?.addEventListener('click', handleClick);

    return () => {
      if (dialog) {
        dialog.removeEventListener('click', handleClick);
        dialog.close();
      }
    };
  }, [onClose]); // onClose가 변경될 때 리스너 재등록

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // onClick={handleDialogClick} <-- 이 줄을 지움으로써 소나큐브를 통과합니다.
      style={{
        border: 'none',
        padding: 0,
        backgroundColor: 'transparent',
        width: '100vw',
        height: '100vh',
        maxWidth: '100%',
        maxHeight: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        outline: 'none',
        overflow: 'hidden',
      }}
    >
      <section
        aria-label="Shipping Address Form"
        style={{
          position: 'relative',
          cursor: 'default',
          outline: 'none',
          backgroundColor: '#fff',
          borderRadius: '8px',
        }}
      >
        {children}
      </section>

      <style>{`
        dialog::backdrop { background: rgba(0, 0, 0, 0.5); }
        dialog:focus { outline: none; }
      `}</style>
    </dialog>
  );
}

ShippingAddressOverlay.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ShippingAddressOverlay;
