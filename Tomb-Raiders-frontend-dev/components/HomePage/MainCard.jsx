import React from 'react';
import PropTypes from 'prop-types';

/**
 * 메인 페이지에서 주요 메뉴나 정보를 강조하여 표시하는 큰 카드 형태의 컴포넌트
 * @param {string} label - 카드 내부에 표시될 텍스트
 * @param {function} vw - 픽셀 단위를 vw 단위로 변환하는 함수
 */
function MainCard({ label, vw }) {
  return (
    <div
      className="bg-[#FFFFFF] border border-[#B4B4B4] rounded-[0.8vw] flex items-center justify-center font-bold text-black shadow-sm w-full h-[12vw] text-center"
      style={{ fontSize: vw(30) }}
    >
      {label}
    </div>
  );
}

// Props 타입 정의 및 필수 여부 설정
MainCard.propTypes = {
  label: PropTypes.string.isRequired,
  vw: PropTypes.func.isRequired,
};

export default MainCard;
