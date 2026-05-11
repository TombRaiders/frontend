import React from 'react';
import PropTypes from 'prop-types';

const vw = (size) => `${(size / 1920) * window.innerWidth}px`;

function OrderTable({ orders, onOrderClick }) {
  const validOrders = orders.filter((o) => o.status !== 'PENDING');

  return (
    <div style={tableWhiteBox}>
      <table style={tableStyle}>
        <thead>
          <tr style={theadRow}>
            <th>주문번호</th>
            <th>상품정보</th>
            <th>수량</th>
            <th>상품 금액</th>
            <th>진행 상태</th>
            <th>접수</th>
          </tr>
        </thead>
        <tbody>
          {validOrders.map((order) => (
            <tr key={order.id} style={tbodyRow}>
              <td onClick={() => onOrderClick(order)} style={orderIdStyle}>
                {order.id}
              </td>
              <td>
                <div style={itemInfo}>
                  <img src={order.assetImagePath || order.img} alt="thumb" style={thumbStyle} />
                  <span style={itemTitleStyle}>{order.title}</span>
                </div>
              </td>
              <td>{order.qty || 1}개</td>
              <td style={{ fontWeight: 'bold' }}>{(order.price || 0).toLocaleString()}원</td>
              <td>
                {/* 📍 무조건 '결제 완료' 이상의 정상 상태만 표시 */}
                <div style={{ fontWeight: 'bold', color: '#2C9753' }}>
                  {order.status || '결제 완료'}
                </div>
              </td>
              <td>
                <button style={actionBtn} onClick={() => onOrderClick(order)}>
                  상세보기
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
OrderTable.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string,
      img: PropTypes.string,
      assetImagePath: PropTypes.string,
      status: PropTypes.string,
      price: PropTypes.number,
      qty: PropTypes.number,
    }),
  ).isRequired,
  onOrderClick: PropTypes.func.isRequired,
};

/* --- 스타일 정의 (한 줄 정리) --- */
const tableWhiteBox = {
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  borderRadius: vw(20),
  padding: vw(20),
  overflow: 'hidden',
  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
};
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const theadRow = {
  borderBottom: '1px solid #eee',
  height: vw(60),
  fontSize: vw(16),
  color: '#333',
};
const tbodyRow = { height: vw(130), borderBottom: '1px solid #f9f9f9', textAlign: 'center' };
const orderIdStyle = {
  cursor: 'pointer',
  textDecoration: 'underline',
  color: '#007AFF',
  fontWeight: 'bold',
};
const itemInfo = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: `0 ${vw(20)}`,
};
const thumbStyle = {
  width: vw(90),
  height: vw(90),
  borderRadius: vw(10),
  objectFit: 'cover',
  border: '1px solid #eee',
};
const itemTitleStyle = { marginLeft: vw(15), textAlign: 'left', fontWeight: '500' };
const actionBtn = {
  padding: `${vw(10)} ${vw(25)}`,
  border: '1px solid #ddd',
  backgroundColor: '#fff',
  cursor: 'pointer',
  borderRadius: vw(8),
  fontSize: vw(14),
};

export default OrderTable;
