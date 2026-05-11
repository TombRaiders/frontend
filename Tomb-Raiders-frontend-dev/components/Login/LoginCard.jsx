import React from 'react';
import PropTypes from 'prop-types';

/**
 * 로그인, 회원가입 등 인증 관련 폼을 중앙에 배치하는 카드 형태의 컨테이너 컴포넌트
 * @param {string} title - 카드 상단에 표시될 제목
 * @param {React.ReactNode} children - 카드 내부에 렌더링될 요소들 (입력창, 버튼 등)
 * @param {function} vw - 픽셀 단위를 vw 단위로 변환하는 함수
 */
function LoginCard({ title, children, vw, height = null }) {
  return (
    <div
      className="bg-[#FFFFFF] rounded-[10px] shadow-sm flex flex-col items-center"
      style={{
        width: vw(600),
        height: height || vw(700),
        padding: vw(60),
        border: `${vw(1)} solid #E0E0E0`,
      }}
    >
      {/* 화면의 주 타이틀 표시 */}
      <h1
        className="font-inter text-black font-bold"
        style={{ fontSize: vw(32), marginBottom: vw(60) }}
      >
        {title}
      </h1>

      {/* 하위 컴포넌트들이 배치되는 영역 */}
      {children}
    </div>
  );
}

// Props 타입 정의 및 필수 검증
LoginCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  vw: PropTypes.func.isRequired,
  height: PropTypes.string,
};

export default LoginCard;
