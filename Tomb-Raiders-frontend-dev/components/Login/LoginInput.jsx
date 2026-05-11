import React from 'react';
import PropTypes from 'prop-types';

/**
 * 로그인 및 회원가입 양식에서 사용하는 하단 테두리 강조형 입력 필드 컴포넌트
 * @param {string} type - input의 타입 (text, password, email 등)
 * @param {string} placeholder - 입력값 부재 시 표시될 안내 텍스트
 * @param {function} vw - 픽셀 단위를 vw 단위로 변환하는 함수
 * @param {string} value - 입력 필드의 현재 값
 * @param {function} onChange - 값 변경 시 호출되는 이벤트 핸들러
 * @param {boolean} required - 필수 입력 여부
 */
function LoginInput({ type, placeholder, vw, value, onChange, required }) {
  return (
    <div className="flex flex-col" style={{ gap: vw(10) }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        // 하단 테두리만 있는 깔끔한 입력창 스타일 적용 (포커스 시 색상 변경)
        className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-black outline-none focus:ring-0 focus:border-[#2C9753] transition-colors"
        style={{
          fontSize: vw(16),
          paddingTop: vw(10),
          paddingBottom: vw(10),
          paddingLeft: vw(4),
          paddingRight: vw(4),
          borderBottomWidth: vw(1.2),
        }}
        placeholder={placeholder}
      />
    </div>
  );
}

// Props 타입 정의 및 필수 검증
LoginInput.propTypes = {
  type: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  vw: PropTypes.func.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  required: PropTypes.bool,
};

export default LoginInput;
