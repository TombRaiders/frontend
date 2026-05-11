import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getCookie } from '../../utils/authUtils';

function OrderListItem({ item, vw, onDelete, onDetail, onQuoteCheck, onOrderSubmit }) {
  const navigate = useNavigate();
  const [paidOrder, setPaidOrder] = useState(null);

  useEffect(() => {
    try {
      const savedOrders = getCookie('myOrders');
      const ordersArray = Array.isArray(savedOrders) ? savedOrders : [];
      const found = item && ordersArray.find((order) => String(order.id) === String(item.id));
      setPaidOrder(found || null);
    } catch (e) {
      console.error('데이터 로드 실패', e);
    }
  }, [item]);

  const handleItemClick = () => {
    if (paidOrder || item?.status === 'PAID') {
      if (onDetail) {
        onDetail();
      } else {
        navigate(`/payments/${item.id}`, { state: { order: item } });
      }
      return;
    }

    if (item?.status === 'QUOTED') {
      if (onQuoteCheck) {
        onQuoteCheck();
      } else {
        navigate('/estimate-detail', { state: { order: item } });
      }
      return;
    }
    navigate('/result', {
      state: { item, order: item, fromList: true },
    });
  };

  const statusConfig = {
    COMPLETED: {
      text: '이미지 생성 완료',
      color: '#4CAF50',
      btnText: '의뢰 신청하기',
      btnColor: '#2C9753',
      action: onOrderSubmit,
    },
    PENDING: {
      text: '견적 확인 중',
      color: '#2C9753',
      btnText: '견적서 도착 대기 중',
      btnColor: '#ccc',
      action: null,
    },
    QUOTED: {
      text: '견적서 도착',
      color: '#6e4aff',
      btnText: '견적서 확인',
      btnColor: '#6e4aff',
      action: onQuoteCheck,
    },
    CANCELLED: {
      text: '의뢰 취소 완료',
      color: '#FF4D4F',
      btnText: '상세 확인',
      btnColor: '#fff',
      action: onDetail,
    },
  };

  const current = paidOrder
    ? {
        text: '결제 완료',
        color: '#2C9753',
        btnText: '결제 상세 보기',
        btnColor: '#6e4aff',
        action: onDetail,
      }
    : (item && statusConfig[item.status]) || {
        text: item?.status || '상태 없음',
        color: '#333',
        btnText: '상세 확인',
        btnColor: '#fff',
        action: onDetail,
      };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick();
    }
  };

  if (!item) return null;

  return (
    <div
      style={{
        ...cardContainer(vw),
        border: '1px solid #EBEBEB',
        display: 'flex',
        width: '100%',
        color: 'inherit',
      }}
    >
      <button
        type="button"
        onClick={handleItemClick}
        onKeyDown={handleKeyDown}
        aria-label={`${item.title || '피규어 의뢰'} 상세 보기`}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          textAlign: 'left',
          flex: 1,
          height: '100%',
          font: 'inherit',
          color: 'inherit',
          outline: 'none',
        }}
      >
        <img src={item.img || ''} alt="thumb" style={imageStyle(vw)} />

        <div style={infoWrapper(vw)}>
          <h4 style={titleStyle(vw)}>{item.title || '피규어 의뢰'}</h4>
          <p style={subTitleStyle(vw)}>
            스타일: {item.style || '-'} | 수량: {item.quantity || 1}개
          </p>
          <div style={{ textAlign: 'left', marginTop: vw(2) }}>
            <span style={{ fontSize: vw(16), fontWeight: 'bold', color: current.color }}>
              ● {current.text}
            </span>
          </div>
        </div>
      </button>

      <div style={buttonWrapper(vw)}>
        <button
          type="button"
          style={mainBtnStyle(vw, current.btnColor, current.btnColor === '#fff' ? '#333' : '#fff')}
          onClick={(e) => {
            e.stopPropagation();
            if (current.action) current.action();
          }}
        >
          {current.btnText}
        </button>
        <button type="button" style={subBtnStyle(vw)} onClick={(e) => e.stopPropagation()}>
          의뢰서 수정
        </button>
        <button
          type="button"
          style={{ ...subBtnStyle(vw), color: '#ff4d4f', borderColor: '#ff4d4f' }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
        >
          삭제
        </button>
      </div>
    </div>
  );
}

OrderListItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    status: PropTypes.string,
    img: PropTypes.string,
    title: PropTypes.string,
    style: PropTypes.string,
    quantity: PropTypes.number,
  }).isRequired,
  vw: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDetail: PropTypes.func.isRequired,
  onQuoteCheck: PropTypes.func,
  onOrderSubmit: PropTypes.func,
};

// 기본값 설정
OrderListItem.defaultProps = {
  onQuoteCheck: () => {},
  onOrderSubmit: () => {},
};

// 스타일 가이드
const cardContainer = (vw) => ({
  width: vw(800),
  height: vw(200),
  backgroundColor: '#FFFFFF',
  border: '1px solid #EBEBEB',
  borderRadius: vw(15),
  marginBottom: vw(25),
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
  boxSizing: 'border-box',
  overflow: 'hidden',
});
const imageStyle = (vw) => ({
  marginLeft: vw(30),
  width: vw(120),
  height: vw(120),
  borderRadius: vw(10),
  objectFit: 'cover',
  flexShrink: 0,
});
const infoWrapper = (vw) => ({
  marginLeft: vw(30),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: vw(8),
  flex: 1,
});
const titleStyle = (vw) => ({
  fontSize: vw(22),
  margin: 0,
  color: '#333',
  fontWeight: 'bold',
  textAlign: 'left',
});
const subTitleStyle = (vw) => ({ fontSize: vw(15), color: '#999', margin: 0, textAlign: 'left' });
const buttonWrapper = (vw) => ({
  marginLeft: 'auto',
  marginRight: vw(30),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: vw(8),
  alignItems: 'flex-end',
});
const mainBtnStyle = (vw, bg, col) => ({
  width: vw(150),
  height: vw(45),
  backgroundColor: bg,
  color: col,
  border: bg === '#fff' ? '1px solid #ddd' : 'none',
  borderRadius: vw(8),
  fontSize: vw(14),
  fontWeight: 'bold',
  cursor: 'pointer',
});
const subBtnStyle = (vw) => ({
  width: vw(150),
  height: vw(35),
  border: '1px solid #ddd',
  borderRadius: vw(6),
  background: '#fff',
  fontSize: vw(13),
  fontWeight: 'bold',
  cursor: 'pointer',
  color: '#666',
});
const disabledBtnStyle = (vw) => ({
  width: vw(150),
  height: vw(35),
  border: '1px solid #eee',
  borderRadius: vw(6),
  background: '#f5f5f5',
  fontSize: vw(13),
  fontWeight: 'bold',
  cursor: 'not-allowed',
  color: '#ccc',
  marginTop: vw(5),
});

export default OrderListItem;
