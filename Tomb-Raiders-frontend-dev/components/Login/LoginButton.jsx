import React from 'react';
import PropTypes from 'prop-types';

/**
 * 로그인 및 회원가입 양식에서 사용하는 표준화된 디자인의 버튼 컴포넌트
 * @param {string} label - 버튼에 표시될 텍스트
 * @param {function} vw - 픽셀 단위를 vw 단위로 변환하는 함수
 * @param {function} onClick - 버튼 클릭 시 실행될 이벤트 핸들러
 * @param {string} type - 버튼의 HTML 타입 (button, submit, reset)
 */
function LoginButton({ label, vw, onClick, type = 'button', disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      // 주황색 배경과 흰색 글씨 등 서비스의 기본 버튼 스타일 적용
      className="w-3/4 mx-auto bg-[#2C9753] text-white font-bold hover:bg-[#257F46] transition-colors shadow-sm cursor-pointer"
      style={{
        fontSize: vw(16),
        paddingTop: vw(10),
        paddingBottom: vw(10),
        marginTop: vw(15),
        borderRadius: vw(4),
        border: '0',
        outline: '0',
        opacity: disabled ? 0.7 : 1,
        cursor: disabled ? 'wait' : 'pointer',
      }}
    >
      {label}
    </button>
  );
}

// Props의 타입 및 필수 로직 검증
LoginButton.propTypes = {
  label: PropTypes.string.isRequired,
  vw: PropTypes.func.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  disabled: PropTypes.bool,
};

export default LoginButton;
