import React from 'react';

function SendCodeButton({ onClick, vw, label = '인증 코드 보내기' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute font-bold text-[#8E8E8E] hover:text-[#257F46] transition-colors"
      style={{
        right: vw(5),
        bottom: vw(12),
        fontSize: vw(14),
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        zIndex: 10,
      }}
    >
      {label}
    </button>
  );
}

export default SendCodeButton;
