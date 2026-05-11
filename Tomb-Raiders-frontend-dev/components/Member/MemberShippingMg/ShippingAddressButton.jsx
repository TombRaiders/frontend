import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../../utils/style';

function ShippingAddressButton({ text, onClick, type = 'white', width = 80 }) {
  const styles = {
    orange: { bg: '#2C9753', color: '#fff', border: 'none' },
    gray: { bg: '#999', color: '#fff', border: 'none' },
    white: { bg: '#fff', color: '#333', border: `${vw(1)} solid #ddd` },
  };
  const currentStyle = styles[type] || styles.white;

  return (
    <button
      onClick={onClick}
      style={{
        width: vw(width),
        height: vw(30),
        borderRadius: vw(10),
        fontSize: vw(10),
        cursor: 'pointer',
        background: currentStyle.bg,
        color: currentStyle.color,
        border: currentStyle.border,
        fontWeight: 'bold',
      }}
    >
      {text}
    </button>
  );
}
ShippingAddressButton.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['orange', 'gray', 'white']),
  width: PropTypes.number,
};

export default ShippingAddressButton;
