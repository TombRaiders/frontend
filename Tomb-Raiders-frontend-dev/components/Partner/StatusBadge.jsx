import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';

// 💡 여러 컴포넌트에서 중복되던 상태값 매핑 로직을 이곳에 모았습니다.
export const getStatusInfo = (status) => {
  switch (status) {
    case 'PENDING':
      return { text: '대기 중', bg: '#FEF3C7', color: '#D97706' };
    case 'REQUESTED':
      return { text: '견적대기', bg: '#FEF3C7', color: '#D97706' };
    case 'ACCEPTED':
      return { text: '수락함', bg: '#D1FAE5', color: '#059669' };
    case 'QUOTED':
      return { text: '견적 완료', bg: '#DBEAFE', color: '#2563EB' };
    case 'PAID':
    case 'PAYMENT_COMPLETED':
      return { text: '결제 완료', bg: '#E0E7FF', color: '#4F46E5' };
    case 'PRODUCING':
      return { text: '제작 중', bg: '#DCFCE7', color: '#16A34A' };
    case 'PRODUCTION_COMPLETED':
      return { text: '제작 완료', bg: '#F3F4F6', color: '#4B5563' };
    case 'SHIPPING':
      return { text: '배송 중', bg: '#E0F2FE', color: '#0284C7' };
    case 'DELIVERED':
      return { text: '배송 완료', bg: '#D1FAE5', color: '#059669' };
    case 'COMPLETED':
      return { text: '작업 완료', bg: '#F3F4F6', color: '#4B5563' };
    case 'CANCELED':
      return { text: '주문 취소', bg: '#FEE2E2', color: '#DC2626' };
    case 'REJECTED':
      return { text: '취소/거절', bg: '#FEE2E2', color: '#DC2626' };
    default:
      return { text: status || '상태 없음', bg: '#F3F4F6', color: '#6B7280' };
  }
};

function StatusBadge({ status }) {
  const statusInfo = getStatusInfo(status);

  return (
    <span
      className="font-bold inline-block"
      style={{
        backgroundColor: statusInfo.bg,
        color: statusInfo.color,
        padding: `${vw(4)} ${vw(12)}`,
        fontSize: vw(11),
        borderRadius: vw(4),
      }}
    >
      {statusInfo.text}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string,
};

export default StatusBadge;
