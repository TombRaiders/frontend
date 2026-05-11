import React from 'react';
import PropTypes from 'prop-types';
import { S } from './OrderDetail.style';

function OrderInfoSection({ title, rows, total }) {
  return (
    <section style={S.infoSection}>
      <h3 style={S.sectionTitle}>{title}</h3>
      {rows.map((row) => (
        <div key={row.label} style={S.infoRow}>
          <span style={S.subLabel}>{row.label}</span>
          <span>{row.value}</span>
        </div>
      ))}
      {total && (
        <div style={{ ...S.infoRow, fontWeight: 'bold', color: '#2C9753', marginTop: S.vw(10) }}>
          <span style={S.subLabel}>결제 금액</span>
          <span>{total.toLocaleString()}원</span>
        </div>
      )}
    </section>
  );
}

OrderInfoSection.propTypes = {
  title: PropTypes.string.isRequired,
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
  ).isRequired,
  total: PropTypes.number,
};

export default OrderInfoSection;
