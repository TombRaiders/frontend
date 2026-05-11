import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';

function CustomAlertModal({
  isOpen,
  onClose,
  icon = '🚨', // 기본 아이콘 설정
  title,
  description,
  leftBtnText = '닫기',
  rightBtnText,
  onRightBtnClick,
}) {
  if (!isOpen) return null;

  return (
    <div
      // 💡 Tailwind 클래스 대신 인라인 스타일로 화면 전체 덮기, 고정 위치, 최상단 z-index를 강제 적용합니다!
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        className="flex flex-col items-center shadow-2xl overflow-hidden"
        style={{
          backgroundColor: '#ffffff',
          width: vw(400),
          borderRadius: vw(8),
          padding: `${vw(40)} ${vw(30)}`,
          border: '1px solid #EEE',
        }}
      >
        {/* 아이콘 영역 */}
        {icon && (
          <div
            style={{
              width: vw(50),
              height: vw(50),
              backgroundColor: '#F0FFF4',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: vw(20),
            }}
          >
            <span style={{ fontSize: vw(24) }}>{icon}</span>
          </div>
        )}

        <h2
          className="font-bold m-0 text-center"
          style={{ fontSize: vw(20), color: '#333', marginBottom: vw(10) }}
        >
          {title}
        </h2>
        <p
          className="m-0 text-center"
          style={{ fontSize: vw(14), color: '#666', marginBottom: vw(30), whiteSpace: 'pre-line' }}
        >
          {description}
        </p>

        {/* 버튼 영역 */}
        <div className="flex justify-center items-center gap-3 w-full" style={{ display: 'flex' }}>
          <button
            type="button"
            onClick={onClose}
            className="text-[#1F2937] bg-[#F3F4F6] font-bold cursor-pointer transition-colors border-none shadow-sm hover:bg-[#E5E7EB]"
            style={{
              flex: 1,
              padding: `${vw(12)} 0`,
              fontSize: vw(14),
              borderRadius: vw(4),
              color: '#1F2937',
              backgroundColor: '#F3F4F6',
            }}
          >
            {leftBtnText}
          </button>

          {rightBtnText && onRightBtnClick && (
            <button
              type="button"
              onClick={onRightBtnClick}
              className="bg-[#2C9753] text-white font-bold cursor-pointer transition-colors shadow-sm hover:bg-[#257F46] border-none"
              style={{
                flex: 1,
                padding: `${vw(12)} 0`,
                fontSize: vw(14),
                borderRadius: vw(4),
                color: '#FFFFFF',
                backgroundColor: '#2C9753',
              }}
            >
              {rightBtnText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

CustomAlertModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  leftBtnText: PropTypes.string,
  rightBtnText: PropTypes.string,
  onRightBtnClick: PropTypes.func,
};

export default CustomAlertModal;
