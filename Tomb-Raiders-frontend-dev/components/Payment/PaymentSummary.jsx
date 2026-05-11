import React from 'react';
import PropTypes from 'prop-types';
import { S } from './PaymentPage.style';

function PaymentSummary({ price, shippingFee }) {
  return (
    <section style={S.box}>
      <h3 style={S.sectionTitle}>최종 결제 금액</h3>
      <div style={S.priceRow}>
        <span>상품 금액</span>
        <span>{price.toLocaleString()}원</span>
      </div>
      <div style={S.priceRow}>
        <span>배송비</span>
        <span>{shippingFee.toLocaleString()}원</span>
      </div>
      <div style={S.divider} />
      <div style={S.totalRow}>
        <span>총 결제금액</span>
        <span>{(price + shippingFee).toLocaleString()}원</span>
      </div>
    </section>
  );
}

PaymentSummary.propTypes = {
  price: PropTypes.number.isRequired,
  shippingFee: PropTypes.number.isRequired,
};

export default PaymentSummary;
