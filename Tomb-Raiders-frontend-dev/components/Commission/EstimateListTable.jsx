import React from 'react';
import PropTypes from 'prop-types';

const vw = (size) => `${(size / 1920) * window.innerWidth}px`;

function EstimateListTable({ estimates, selectedEstimateId, onSelect }) {
  return (
    <div style={S.tableContainer}>
      <table style={S.tableStyle}>
        <thead>
          <tr style={S.theadStyle}>
            <th>선택</th>
            <th>상품정보</th>
            <th>수량</th>
            <th>상품 합계 금액</th>
            <th>견적서 작성자</th>
          </tr>
        </thead>
        <tbody>
          {estimates.map((est) => (
            <tr
              key={est.id}
              style={{
                ...S.trStyle,
                backgroundColor: selectedEstimateId === est.id ? '#F0FFF4' : '#fff',
              }}
              onClick={() => onSelect(est.id)}
            >
              <td>
                <input type="radio" checked={selectedEstimateId === est.id} readOnly />
              </td>
              <td>
                <div style={S.tableItemStyle}>
                  <img src={est.img} style={S.smallImgStyle} alt="thumb" />
                  <div style={{ textAlign: 'left', marginLeft: vw(10) }}>
                    <div style={{ fontWeight: 'bold' }}>{est.title}</div>
                    <div style={{ fontSize: vw(12), color: '#666' }}>스타일: {est.style}</div>
                  </div>
                </div>
              </td>
              <td>{est.qty}</td>
              <td>{est.price.toLocaleString()}원</td>
              <td>{est.sender}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

EstimateListTable.propTypes = {
  estimates: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      img: PropTypes.string,
      title: PropTypes.string,
      style: PropTypes.string,
      qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      price: PropTypes.number,
      sender: PropTypes.string,
    }),
  ).isRequired,
  selectedEstimateId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelect: PropTypes.func.isRequired,
};

const S = {
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: vw(15),
    border: '1px solid #ddd',
    overflow: 'hidden',
  },
  tableStyle: { width: '100%', borderCollapse: 'collapse', textAlign: 'center' },
  theadStyle: { backgroundColor: '#fff', borderBottom: '1px solid #eee', height: vw(60) },
  trStyle: { height: vw(100), borderBottom: '1px solid #eee', cursor: 'pointer' },
  tableItemStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  smallImgStyle: { width: vw(60), height: vw(60), borderRadius: vw(8), objectFit: 'cover' },
};

export default EstimateListTable;
