import React from 'react';
import PropTypes from 'prop-types';

function SignupInput({ name, type, placeholder, vw, value, onChange, required }) {
  return (
    <div className="flex flex-col" style={{ gap: vw(10) }}>
      <input
        name={name} // 어떤 필드인지 구분하기 위해 추가
        type={type}
        value={value} // 부모(SignupPage)의 데이터 연결
        onChange={onChange} // 입력 시 데이터 업데이트
        required={required}
        // 원본 스타일 유지 (로그인 인풋과 동일한 스타일 적용 권장)
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

// SonarLint 이슈 해결을 위한 Props 검증
SignupInput.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  vw: PropTypes.func.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  required: PropTypes.bool,
};

export default SignupInput;
