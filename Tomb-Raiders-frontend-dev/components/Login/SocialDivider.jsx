import React from 'react';
import PropTypes from 'prop-types';

/**
 * 로그인 화면에서 서로 다른 인증 방식(예: 일반, 소셜) 사이를 시각적으로 분리하고 텍스트를 표시하는 구분선 컴포넌트
 * @param {string} text - 구분선 중앙에 표시될 텍스트
 * @param {function} vw - 픽셀 단위를 vw 단위로 변환하는 함수
 */
function SocialDivider({ text, vw }) {
  return (
    <div className="w-4/5 flex items-center" style={{ marginTop: vw(80), gap: vw(15) }}>
      {/* 좌측 구분선 */}
      <div className="flex-1 bg-[#000000]" style={{ height: vw(1) }} />
      {/* 중앙 안내 문구 */}
      <span className="text-gray-400 whitespace-nowrap font-light" style={{ fontSize: vw(13) }}>
        {text}
      </span>
      {/* 우측 구분선 */}
      <div className="flex-1 bg-[#000000]" style={{ height: vw(1) }} />
    </div>
  );
}

// Props 타입 정의 및 필수 검증
SocialDivider.propTypes = {
  text: PropTypes.string.isRequired,
  vw: PropTypes.func.isRequired,
};

export default SocialDivider;
