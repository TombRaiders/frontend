import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../../utils/style';

/**
 * 대시보드 상단에서 특정 상태(예: 배송준비, 취소요청 등)의 건수를 한눈에 볼 수 있도록 표시하는 요약 카드 컴포넌트
 * 아이콘 영역과 라벨, 숫자 수치를 포함함
 * @param {string} label - 표시할 상태의 이름 (예: '배송중')
 * @param {number} count - 해당 상태의 수량 또는 건수
 */
function StatusCard({ label, count }) {
  return (
    <div className="flex items-start" style={{ gap: vw(10) }}>
      {/* 상태를 나타내는 아이콘이 위치할 박스 영역 */}
      <div className="border border-gray-300 bg-white" style={{ width: vw(38), height: vw(38) }} />
      <div className="flex flex-col" style={{ marginTop: vw(-2) }}>
        {/* 상태 라벨 표시 영역 */}
        <span
          className="text-gray-500 font-medium"
          style={{ fontSize: vw(10), letterSpacing: '-0.02em' }}
        >
          {label}
        </span>
        {/* 수량 수치 및 단위 표시 영역 */}
        <span className="font-semibold text-gray-900" style={{ fontSize: vw(22), lineHeight: 1.1 }}>
          {count}
          <span style={{ fontSize: vw(16), marginLeft: vw(2) }}>건</span>
        </span>
      </div>
    </div>
  );
}

// Props 타입 정의 및 검증
StatusCard.propTypes = {
  label: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
};

export default StatusCard;
