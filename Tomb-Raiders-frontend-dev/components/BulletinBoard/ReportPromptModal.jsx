import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';

function ReportPromptModal({ modalData, setModalData, onSubmit }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (modalData.isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [modalData.isOpen]);

  if (!modalData.isOpen) return null;

  const handleClose = () => {
    setModalData({ ...modalData, isOpen: false, reason: '' });
  };

  const isReasonProvided = modalData.reason?.trim().length > 0;

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      style={{
        padding: 0,
        border: 'none',
        backgroundColor: 'transparent',
        overflow: 'visible',
      }}
    >
      {/* 💡 [S6847, S1082 해결] 
        비대화형 요소(div, dialog)에 onClick을 거는 대신, 
        배경 전체를 덮는 투명한 '진짜 버튼'을 생성합니다. 
      */}
      <button
        type="button"
        onClick={handleClose}
        aria-label="모달 닫기"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'default',
        }}
      />

      {/* 실제 모달 콘텐츠 박스 (이벤트 리스너 없음) */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: '#FFF',
          padding: vw(30),
          borderRadius: vw(16),
          width: vw(400),
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h3
          style={{
            margin: `0 0 ${vw(20)} 0`,
            fontSize: vw(20),
            color: '#0F172A',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: vw(8),
          }}
        >
          <span style={{ color: '#EF4444' }}>🚨</span> {modalData.title}
        </h3>

        <textarea
          placeholder="신고 사유를 구체적으로 적어주세요."
          value={modalData.reason}
          onChange={(e) => setModalData({ ...modalData, reason: e.target.value })}
          style={{
            width: '100%',
            height: vw(120),
            padding: vw(14),
            border: `${vw(1)} solid #CBD5E1`,
            borderRadius: vw(8),
            boxSizing: 'border-box',
            marginBottom: vw(20),
            fontSize: vw(14),
            outline: 'none',
            resize: 'none',
            lineHeight: 1.5,
            fontFamily: 'inherit',
          }}
        />

        <div style={{ display: 'flex', gap: vw(10) }}>
          <button
            type="button"
            onClick={handleClose}
            style={{
              flex: 1,
              padding: vw(12),
              backgroundColor: '#F1F5F9',
              color: '#475569',
              border: 'none',
              borderRadius: vw(8),
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: vw(14),
            }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!isReasonProvided}
            style={{
              flex: 1,
              padding: vw(12),
              // 💡 S7735 해결: 긍정 조건을 앞쪽으로 배치
              backgroundColor: isReasonProvided ? '#EF4444' : '#FDA4AF',
              color: '#FFF',
              border: 'none',
              borderRadius: vw(8),
              cursor: isReasonProvided ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              fontSize: vw(14),
            }}
          >
            접수하기
          </button>
        </div>
      </div>

      <style>
        {`
          dialog::backdrop {
            background-color: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(4px);
          }
        `}
      </style>
    </dialog>
  );
}

ReportPromptModal.propTypes = {
  modalData: PropTypes.shape({
    isOpen: PropTypes.bool.isRequired,
    title: PropTypes.string,
    reason: PropTypes.string,
  }).isRequired,
  setModalData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default ReportPromptModal;
