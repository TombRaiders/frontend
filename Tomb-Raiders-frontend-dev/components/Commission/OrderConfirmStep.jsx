import React from 'react';
import PropTypes from 'prop-types';

const vw = (size) => `${(size / 1920) * window.innerWidth}px`;

const finalCardStyle = {
  width: vw(450),
  backgroundColor: '#fff',
  borderRadius: vw(20),
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  padding: vw(30),
  border: '1px solid #eee',
};
const finalImgStyle = { width: '100%', height: vw(500), objectFit: 'cover', borderRadius: vw(12) };
const finalInfoStyle = { marginTop: vw(25), display: 'flex', flexDirection: 'column', gap: vw(12) };
const infoRow = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: vw(18),
  borderBottom: '1px solid #f5f5f5',
  paddingBottom: vw(8),
};

const orangeBtnStyle = {
  width: vw(260),
  height: vw(65),
  backgroundColor: '#2C9753',
  color: '#FFF',
  border: 'none',
  borderRadius: vw(12),
  fontSize: vw(20),
  fontWeight: 'bold',
  cursor: 'pointer',
};
const whiteBtnStyle = {
  width: vw(260),
  height: vw(65),
  backgroundColor: '#FFF',
  color: '#333',
  border: '1px solid #333',
  borderRadius: vw(12),
  fontSize: vw(20),
  fontWeight: 'bold',
  cursor: 'pointer',
};

function OrderConfirmStep({ aiImg, style, onBack, onQuote }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <h2 style={{ fontSize: vw(28), fontWeight: 'bold', marginBottom: vw(40) }}>생성 완료</h2>

      {/* 최종 이미지 카드 */}
      <div style={finalCardStyle}>
        <img src={aiImg} style={finalImgStyle} alt="최종본" />
        <div style={finalInfoStyle}>
          <div style={infoRow}>
            <span>이미지 스타일</span>
            <strong>{style}</strong>
          </div>
          <div style={infoRow}>
            <span>생성 일자</span>
            <strong>2026.02.11</strong>
          </div>
        </div>
      </div>

      <p style={{ marginTop: vw(30), color: '#666', fontSize: vw(16) }}>
        위 이미지로 견적을 신청하시겠습니까? 신청 후에는 어드민의 견적을 기다려야 합니다.
      </p>

      {/* 버튼 영역 */}
      <div style={{ marginTop: vw(50), display: 'flex', gap: vw(20) }}>
        <button onClick={onBack} style={whiteBtnStyle}>
          의뢰 목록으로
        </button>
        <button onClick={onQuote} style={orangeBtnStyle}>
          견적 신청하기
        </button>
      </div>
    </div>
  );
}

OrderConfirmStep.propTypes = {
  aiImg: PropTypes.string.isRequired,
  style: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
  onQuote: PropTypes.func.isRequired,
};

export default OrderConfirmStep;
