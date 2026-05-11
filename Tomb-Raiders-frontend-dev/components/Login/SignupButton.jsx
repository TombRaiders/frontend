import React from 'react';
import PropTypes from 'prop-types';

function SignupButton({ label, vw, onClick, type = 'button' }) {
  return (
    <button
      type={type} // "submit"으로 설정 시 폼 제출 가능
      onClick={onClick}
      // 원본 디자인 클래스 유지
      className="w-3/4 mx-auto bg-[#2C9753] text-white font-bold hover:bg-[#257F46] transition-colors shadow-sm cursor-pointer"
      style={{
        fontSize: vw(16),
        paddingTop: vw(10),
        paddingBottom: vw(10),
        marginTop: vw(15),
        borderRadius: vw(4),
        border: '0',
        outline: '0',
      }}
    >
      {label}
    </button>
  );
}

SignupButton.propTypes = {
  label: PropTypes.string.isRequired,
  vw: PropTypes.func.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default SignupButton;
