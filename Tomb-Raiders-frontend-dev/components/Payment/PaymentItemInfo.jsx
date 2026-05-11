import React from 'react';
import PropTypes from 'prop-types';
import { S } from './PaymentPage.style';

function PaymentItemInfo({ itemName, price, commissionId, img }) {
  return (
    <section style={S.box}>
      <h3 style={S.sectionTitle}>주문 상품 정보</h3>
      <div style={S.itemDetail}>
        <img src={img || 'https://via.placeholder.com/100'} alt="item" style={S.itemImg} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontWeight: 'bold', fontSize: S.vw(18), margin: 0 }}>{itemName}</p>
          <p style={{ color: '#666', fontSize: S.vw(14), marginTop: S.vw(5) }}>
            의뢰 ID: {commissionId}
          </p>
          <p style={{ marginTop: S.vw(8), fontWeight: 'bold', color: '#333' }}>
            {price.toLocaleString()}원
          </p>
        </div>
      </div>
    </section>
  );
}

PaymentItemInfo.propTypes = {
  itemName: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  commissionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  img: PropTypes.string,
};

export default PaymentItemInfo;
