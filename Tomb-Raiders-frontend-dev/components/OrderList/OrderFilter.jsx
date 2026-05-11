import React from 'react';
import PropTypes from 'prop-types';

const vw = (size) => `${(size / 1920) * window.innerWidth}px`;

function OrderFilter({ filter, setFilter }) {
  const options = ['오늘', '1개월', '6개월', '1년', '전체'];

  return (
    <div style={filterContainer}>
      <p style={filterLabel}>입금 확인</p>
      <div style={filterWhiteBox}>
        <div style={btnGroup}>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              style={{
                ...filterBtn,
                backgroundColor: filter === opt ? '#2C9753' : '#fff',
                color: filter === opt ? '#fff' : '#000',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
        <button style={searchBtn}>조회</button>
      </div>
    </div>
  );
}

OrderFilter.propTypes = {
  filter: PropTypes.string.isRequired,
  setFilter: PropTypes.func.isRequired,
};

const filterContainer = { marginBottom: vw(50), textAlign: 'left' };
const filterLabel = { fontSize: vw(18), marginBottom: vw(15), fontWeight: '500' };

// 📍 시안의 큰 테두리 박스 스타일
const filterWhiteBox = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  borderRadius: vw(20),
  padding: `${vw(30)} ${vw(40)}`,
  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
};

const btnGroup = {
  display: 'flex',
  border: '1px solid #ddd',
  borderRadius: vw(5),
  overflow: 'hidden',
};
const filterBtn = {
  border: 'none',
  borderRight: '1px solid #ddd',
  padding: `${vw(10)} ${vw(30)}`,
  cursor: 'pointer',
  fontSize: vw(14),
};
const searchBtn = {
  backgroundColor: '#fff',
  border: '1px solid #333',
  padding: `${vw(10)} ${vw(50)}`,
  borderRadius: vw(5),
  cursor: 'pointer',
  fontWeight: 'bold',
};

export default OrderFilter;
