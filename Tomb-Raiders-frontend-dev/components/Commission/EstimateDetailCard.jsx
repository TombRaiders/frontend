import React from 'react';
import PropTypes from 'prop-types';

const vw = (size) => `${(size / 1920) * window.innerWidth}px`;

function EstimateDetailCard({ selectedEst, commissionId }) {
  return (
    <div
      style={{
        ...S.cardStyle,
        minHeight: vw(520),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: selectedEst ? 'flex-start' : 'center',
        alignItems: 'center',
      }}
    >
      {selectedEst ? (
        <>
          <img src={selectedEst.img} alt="request" style={S.mainImgStyle} />
          <div style={S.infoArea}>
            <div style={S.infoRow}>
              <strong>의뢰 명</strong>
              <span>{selectedEst.title}</span>
            </div>
            <div style={S.infoRow}>
              <strong>의뢰 번호</strong>
              <span>{commissionId}</span>
            </div>
            <div style={S.infoRow}>
              <strong>스타일</strong>
              <span>{selectedEst.style}</span>
            </div>
            <div style={S.infoRow}>
              <strong>수량</strong>
              <span>{selectedEst.qty}</span>
            </div>
            <div
              style={{
                ...S.infoRow,
                color: '#2C9753',
                fontWeight: 'bold',
                border: 'none',
                marginTop: vw(10),
              }}
            >
              <strong>최종 견적 금액</strong>
              <span>{selectedEst.price.toLocaleString()}원</span>
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', color: '#bbb' }}>
          <div style={{ fontSize: vw(60), marginBottom: vw(20) }}>✨</div>
          <p style={{ fontSize: vw(18), lineHeight: 1.6 }}>
            확인할 견적서를 <br /> <strong>오른쪽 목록에서 선택</strong>해주세요.
          </p>
        </div>
      )}
    </div>
  );
}

EstimateDetailCard.propTypes = {
  selectedEst: PropTypes.shape({
    img: PropTypes.string,
    title: PropTypes.string,
    style: PropTypes.string,
    qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    price: PropTypes.number,
  }),
  commissionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const S = {
  cardStyle: {
    backgroundColor: '#fff',
    borderRadius: vw(15),
    border: '1px solid #ddd',
    padding: vw(30),
    boxSizing: 'border-box',
  },
  mainImgStyle: {
    width: '100%',
    height: vw(350),
    borderRadius: vw(15),
    marginBottom: vw(20),
    objectFit: 'cover',
  },
  infoArea: { display: 'flex', flexDirection: 'column', gap: vw(10), width: '100%' },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: vw(16),
    borderBottom: '1px solid #eee',
    paddingBottom: vw(5),
  },
};

export default EstimateDetailCard;
