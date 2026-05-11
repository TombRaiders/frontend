import React from 'react';
import PropTypes from 'prop-types';
import { S } from './PaymentPage.style';

function PaymentAddress({ address, onChangeClick }) {
  return (
    <section style={S.box}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: S.vw(20),
        }}
      >
        <h3 style={S.sectionTitle}>배송 정보</h3>
        <button style={S.changeBtn} onClick={onChangeClick}>
          배송지 변경
        </button>
      </div>
      {address ? (
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontWeight: 'bold', margin: 0 }}>
            {address.receiverName} <span style={S.badge}>기본배송지</span>
          </p>
          <p style={{ color: '#666', marginTop: S.vw(5) }}>
            ({address.zipCode}) {address.address} {address.detailAddress}
          </p>
          <p style={{ color: '#666' }}>{address.phone}</p>
        </div>
      ) : (
        <p style={{ color: '#999' }}>등록된 배송지가 없습니다.</p>
      )}
    </section>
  );
}

PaymentAddress.propTypes = {
  address: PropTypes.shape({
    receiverName: PropTypes.string,
    zipCode: PropTypes.string,
    address: PropTypes.string,
    detailAddress: PropTypes.string,
    phone: PropTypes.string,
  }),
  onChangeClick: PropTypes.func.isRequired,
};

export default PaymentAddress;
