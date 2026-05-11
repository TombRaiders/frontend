import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';
import PartnerTableLayout from './PartnerTableLayout';
import StatusBadge from './StatusBadge'; // 💡 공통 배지 컴포넌트 불러오기

function AcceptedTable({
  orders = [],
  isLoading = false,
  selectedOrder,
  selectedOrderIds = [],
  onSelectOrder,
  onSelectionChange,
  pagination,
}) {
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange(orders.map((o) => o.orderId));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) {
      onSelectionChange([...selectedOrderIds, id]);
    } else {
      onSelectionChange(selectedOrderIds.filter((val) => val !== id));
    }
  };

  // 💡 테이블 헤더 정의
  const tableHeaders = (
    <>
      <th className="border-r border-[#BDBDBD]" style={{ width: vw(48) }}>
        <input
          type="checkbox"
          checked={orders.length > 0 && selectedOrderIds.length === orders.length}
          onChange={handleSelectAll}
          style={{ width: vw(16), height: vw(16), cursor: 'pointer' }}
        />
      </th>
      <th className="border-r border-[#BDBDBD]">의뢰 번호</th>
      <th className="border-r border-[#BDBDBD]">의뢰자 ID</th>
      <th className="border-r border-[#BDBDBD]">의뢰 내용</th>
      <th>진행 상태</th>
    </>
  );

  return (
    <PartnerTableLayout
      columnsCount={5}
      headers={tableHeaders}
      isLoading={isLoading}
      isEmpty={orders.length === 0}
      emptyMessage="수락된 의뢰 내역이 없습니다."
      pagination={pagination}
    >
      {orders.map((order) => (
        <tr
          key={order.orderId}
          onClick={() => onSelectOrder?.(order)}
          className="border-b border-[#E0E0E0] hover:bg-gray-50 transition-colors last:border-b-0 cursor-pointer"
          style={{
            height: vw(55),
            backgroundColor: selectedOrder?.orderId === order.orderId ? '#F0F8FF' : 'white',
          }}
        >
          <td className="border-r border-[#E0E0E0]">
            <input
              type="checkbox"
              checked={selectedOrderIds.includes(order.orderId)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleSelectOne(e, order.orderId)}
              style={{ width: vw(16), height: vw(16), cursor: 'pointer' }}
            />
          </td>
          <td className="border-r border-[#E0E0E0]">{order.orderId}</td>
          <td className="border-r border-[#E0E0E0]">{order.memberId}</td>
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
          <td>
            {/* 💡 복잡한 코드 대신 한 줄로 렌더링! */}
            <StatusBadge status={order.status} />
          </td>
        </tr>
      ))}
    </PartnerTableLayout>
  );
}

AcceptedTable.propTypes = {
  orders: PropTypes.array,
  isLoading: PropTypes.bool,
  selectedOrder: PropTypes.object,
  selectedOrderIds: PropTypes.array,
  onSelectOrder: PropTypes.func,
  onSelectionChange: PropTypes.func.isRequired,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
  }),
};

export default AcceptedTable;
