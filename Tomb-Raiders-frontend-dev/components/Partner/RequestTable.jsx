import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';
import { post } from '../../api/apiClient';
import PartnerTableLayout from './PartnerTableLayout';
import StatusBadge from './StatusBadge'; // 💡 공통 배지 컴포넌트 불러오기

const ACTIONABLE_REQUEST_STATUSES = new Set(['PENDING', 'REQUESTED']);

function RequestTable({
  orders = [],
  isLoading = false,
  selectedOrder,
  onSelectOrder,
  refreshOrders,
  showAlert,
  showConfirm,
  pagination,
}) {
  const handleAccept = (orderId) => {
    showConfirm('❓', '의뢰 수락', '이 의뢰를 수락하시겠습니까?', async () => {
      try {
        const res = await post(`/v1/partners/orders/${orderId}/accept`);
        if (res?.data?.isSuccess) {
          showAlert('✅', '수락 완료', '의뢰를 수락했습니다.');
          refreshOrders();
        }
      } catch (err) {
        console.error('수락 실패:', err);
        showAlert('🚨', '수락 실패', '오류가 발생했습니다.');
      }
    });
  };

  const handleReject = (orderId) => {
    showConfirm('❓', '의뢰 거절', '이 의뢰를 거절하시겠습니까?', async () => {
      try {
        const res = await post(`/v1/partners/orders/${orderId}/reject`);
        if (res?.data?.isSuccess) {
          showAlert('✅', '거절 완료', '의뢰를 거절했습니다.');
          if (selectedOrder?.orderId === orderId) onSelectOrder(null);
          refreshOrders();
        }
      } catch (err) {
        console.error('거절 실패:', err);
        showAlert('🚨', '거절 실패', '오류가 발생했습니다.');
      }
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  // 💡 테이블 헤더 정의
  const tableHeaders = (
    <>
      <th className="border-r border-[#BDBDBD]">의뢰번호</th>
      <th className="border-r border-[#BDBDBD]">의뢰자</th>
      <th className="border-r border-[#BDBDBD]">의뢰 내용</th>
      <th className="border-r border-[#BDBDBD]">신청 날짜</th>
      <th>의뢰상태 및 관리</th>
    </>
  );

  return (
    <PartnerTableLayout
      columnsCount={5}
      headers={tableHeaders}
      isLoading={isLoading}
      isEmpty={orders.length === 0}
      emptyMessage="현재 대기 중인 의뢰가 없습니다."
      pagination={pagination}
    >
      {orders.map((order) => {
        const isSelected = selectedOrder?.orderId === order.orderId;
        const isActionDisabled = !ACTIONABLE_REQUEST_STATUSES.has(order.status);

        return (
          <tr
            key={order.orderId}
            className="border-b border-[#E0E0E0] transition-colors"
            style={{ height: vw(55), backgroundColor: isSelected ? '#F0F8FF' : 'white' }}
          >
            <td className="border-r border-[#E0E0E0]">{order.orderId}</td>
            <td className="border-r border-[#E0E0E0]">{order.memberId || '알 수 없음'}</td>
            <td
              className="border-r border-[#E0E0E0]"
              style={{
                maxWidth: vw(200),
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {order.requirements}
            </td>
            <td className="border-r border-[#E0E0E0] text-gray-500">
              {formatDate(order.createdAt)}
            </td>
            <td>
              <div className="flex justify-center items-center" style={{ gap: vw(8) }}>
                {/* 💡 복잡한 코드 대신 한 줄로 렌더링! */}
                <StatusBadge status={order.status} />

                <button
                  type="button"
                  onClick={() => onSelectOrder(order)}
                  className="bg-[#757575] text-white transition-colors hover:bg-gray-600 border-none cursor-pointer"
                  style={{ padding: `${vw(4)} ${vw(12)}`, fontSize: vw(11), borderRadius: vw(4) }}
                >
                  상세
                </button>
                <button
                  type="button"
                  onClick={() => handleAccept(order.orderId)}
                  disabled={isActionDisabled}
                  className={`text-white transition-colors border-none ${isActionDisabled ? 'bg-gray-400 opacity-50 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'}`}
                  style={{ padding: `${vw(4)} ${vw(12)}`, fontSize: vw(11), borderRadius: vw(4) }}
                >
                  수락
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(order.orderId)}
                  disabled={isActionDisabled}
                  className={`text-white transition-colors border-none ${isActionDisabled ? 'bg-gray-400 opacity-50 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 cursor-pointer'}`}
                  style={{ padding: `${vw(4)} ${vw(12)}`, fontSize: vw(11), borderRadius: vw(4) }}
                >
                  거절
                </button>
              </div>
            </td>
          </tr>
        );
      })}
    </PartnerTableLayout>
  );
}

RequestTable.propTypes = {
  orders: PropTypes.array,
  isLoading: PropTypes.bool,
  selectedOrder: PropTypes.object,
  onSelectOrder: PropTypes.func.isRequired,
  refreshOrders: PropTypes.func.isRequired,
  showAlert: PropTypes.func.isRequired,
  showConfirm: PropTypes.func.isRequired,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
  }),
};

export default RequestTable;
