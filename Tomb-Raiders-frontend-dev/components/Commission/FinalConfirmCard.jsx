import React from 'react';
import PropTypes from 'prop-types';

const vw = (size) => `${(size / 1920) * window.innerWidth}px`;
function FinalConfirmCard({ aiImg, style, title, onBackToList, onSubmit }) {
  const S = getStyles();
  return (
    <div style={S.stepContainer}>
      <h2 style={S.titleStyle}>견적 신청 확인</h2>
      <div style={S.finalCard}>
        <img src={aiImg} style={S.finalImg} alt="최종본" />
        <div style={S.finalInfo}>
          <div style={S.infoRow}>
            <span>의뢰 스타일</span>
            <strong>{style}</strong>
          </div>
          <div style={S.infoRow}>
            <span>의뢰명</span>
            <strong>{title}</strong>
          </div>
          <div style={S.infoRow}>
            <span>생성 일시</span>
            <strong>2026.02.11</strong>
          </div>
        </div>
      </div>
      <div style={S.btnGroup}>
        <button onClick={onBackToList} style={S.whiteBtn}>
          의뢰 목록으로
        </button>
        <button onClick={onSubmit} style={S.orangeBtn}>
          견적 신청하기
        </button>
      </div>
    </div>
  );
}

FinalConfirmCard.propTypes = {
  aiImg: PropTypes.string.isRequired,
  style: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onBackToList: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

const getStyles = () => ({
  stepContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  titleStyle: { fontSize: vw(32), fontWeight: 'bold', marginBottom: vw(50) },
  finalCard: { width: vw(400), textAlign: 'center' },
  finalImg: {
    width: '100%',
    borderRadius: vw(15),
    marginBottom: vw(20),
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  finalInfo: { backgroundColor: '#F9F9F9', padding: vw(20), borderRadius: vw(10) },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: vw(10),
    fontSize: vw(16),
  },
  btnGroup: { display: 'flex', gap: vw(20), marginTop: vw(20) },
  orangeBtn: {
    width: vw(250),
    height: vw(60),
    backgroundColor: '#2C9753',
    color: '#FFF',
    border: 'none',
    borderRadius: vw(12),
    fontSize: vw(18),
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  whiteBtn: {
    width: vw(250),
    height: vw(60),
    backgroundColor: '#FFF',
    color: '#333',
    border: '1px solid #333',
    borderRadius: vw(12),
    fontSize: vw(18),
    fontWeight: 'bold',
    cursor: 'pointer',
  },
});

export default FinalConfirmCard;
